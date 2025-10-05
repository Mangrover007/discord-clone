import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import url from "url";
import jwt from "jsonwebtoken";

import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { router } from "./routes.mjs";
import { handleDm, handleServerCreate, handleServerJoin, handleServerMessage, verifyClientFunction } from "./utils.mjs";
export const prisma = new PrismaClient();
export const userToSocket = new Map();

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

// app.get("/serv", async (req, res) => {
//   try {
//     const servers = await prisma.server.findMany({
//       select: { id: true, name: true },
//     });
//     res.send(servers);
//   } catch (e) {
//     console.error("Error fetching servers:", e);
//     res.status(500).send("error fetching servers");
//   }
// });

// app.get("/use", async (req, res) => {
//   try {
//     const users = await prisma.user.findMany({
//       select: { id: true, username: true },
//     });
//     res.send(users);
//   } catch (e) {
//     console.error("Error fetching users:", e);
//     res.status(500).send("error fetching users");
//   }
// });

// app.get("/mapping", async (req, res) => {
//     const keys = [];
//     userToSocket.forEach((val, key) => {
//         keys.push(key);
//     })
//     for (let i = 0; i < keys.length; i++) {
//         const findUser = await prisma.user.findUnique({ where: { id: keys[i] } });
//         console.log(findUser.username + " - " + findUser.id)
//     }
//     return res.send(userToSocket.size);
// })

const PORT = 3000;
const server = app.listen(PORT, () => {
    console.log("listening on port " + PORT)
})

const webSocketServer = new WebSocketServer({
    server: server, path: "/ws",
    verifyClient: verifyClientFunction
});

webSocketServer.on("connection", (newSocket, req) => {
    const userId = req.user.id;
    userToSocket.set(userId, newSocket);
    newSocket.on("message", async mes => {
        const payload = JSON.parse(mes);
        const { type } = payload;
        try {
            if (type === "dm") handleDm(payload, newSocket, req);
            else if (type === "server-create") handleServerCreate(payload, newSocket);
            else if (type === "server") handleServerMessage(payload, newSocket, req);
            else if (type === "server-join") handleServerJoin(payload, socket);
        }
        catch (e) {
            console.log("error happened - ", e);
        }
    })
})

export { server };
