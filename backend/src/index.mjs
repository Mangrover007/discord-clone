import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import url from "url";
import jwt from "jsonwebtoken";

import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { router } from "./routes.mjs";
export const prisma = new PrismaClient();
const userToSocket = new Map();

dotenv.config();
export const env = process.env;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(router);

app.get("/", (req, res) => {
    console.log(req.headers.cookie);
    console.log(req.cookies);
    res.send("OK");
})

app.get("/mapping", async (req, res) => {
    const keys = [];
    userToSocket.forEach((val, key) => {
        keys.push(key);
    })
    for (let i = 0; i < keys.length; i++) {
        const findUser = await prisma.user.findUnique({ where: { id: keys[i] } });
        console.log(findUser.username + " - " + findUser.id)
    }
    return res.send(userToSocket.size);
})

const PORT = 3000;
const server = app.listen(PORT, () => {
    console.log("listening on port " + PORT)
})

const webSocketServer = new WebSocketServer({
    server: server, path: "/ws",
    verifyClient: async (info, callback) => {
        console.log("Person is trying receiver connect lmao");

        const cookieHeader = info.req.headers.cookie;

        if (!cookieHeader) {
            console.log("No cookies found");
            return callback(false, 401, "No cookies present");
        }

        const cookies = Object.fromEntries(
            cookieHeader.split(";").map(cookie => {
                const [key, value] = cookie.trim().split("=");
                return [key, decodeURIComponent(value)];
            })
        );

        console.log("Parsed cookies:", cookies);

        const token = cookies.token;

        if (!token) {
            console.log("No token cookie found");
            return callback(false, 401, "Token missing");
        }

        try {
            const decoded = jwt.verify(token, env.JWT_SECRET);
            console.log("JWT verified, user:", decoded);

            // Optional: attach user info receiver req if you want later access
            info.req.user = decoded;

            callback(true); // Accept the connection
        } catch (err) {
            console.error("JWT verification failed:", err.message);
            return callback(false, 401, "Invalid token");
        }
    }
});

webSocketServer.on("connection", (newSocket, req) => {
    console.log("user is authenticated now");
    // console.log(req.user);
    userToSocket.set(req.user.id, newSocket);
    newSocket.on("message", async (mes) => {
        const payload = JSON.parse(mes);
        const { type, message, to: receiver } = payload;
        console.log(payload);
        try {
            if (type === "dm") {
                const findUser = await prisma.user.findUnique({ where: { username: receiver } });
                if (findUser) {
                    await prisma.dMMessage.create({
                        data: {
                            content: message,
                            sender: { connect: { username: req.user.username } },
                            receiver: { connect: { username: receiver } }
                        }
                    })
                    if (userToSocket.has(findUser.id)) {
                        const findUserSocket = userToSocket.get(findUser.id);
                        console.log("find user socket", findUserSocket);
                        findUserSocket.send(JSON.stringify({
                            username: req.user.username,
                            message: message
                        }))
                    }
                    newSocket.send(JSON.stringify({
                        username: req.user.username,
                        message: message
                    }))
                }
            }
        }
        catch (e) {
            console.log("error happened - ", e);
        }
    })
})

export { server };
