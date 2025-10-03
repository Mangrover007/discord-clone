import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import url from "url";
import jwt from "jsonwebtoken";
import { hash, compare } from "bcryptjs"
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

dotenv.config();
const env = process.env;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.get("/", (req, res) => {
    console.log(req.headers.cookie);
    console.log(req.cookies);
    res.send("OK");
})

app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const findUser = await prisma.user.findUnique({ where: { email: email } })
        if (findUser) {
            return res.status(409).send("user already exists. log in from /login");
        }
        const hashPassword = await hash(password, 10)
        console.log(username, email, password)
        const createUser = await prisma.user.create({
            data: {
                username: username,
                email: email,
                password: hashPassword
            }
        })
        return res.status(201).send({
            message: "user registers",
            user: createUser
        })
    }
    catch (e) {
        return res.sendStatus(500);
    }
});

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const findUser = await prisma.user.findUnique({ where: { username: username } });
        if (!findUser) {
            return res.status(404).send("user not found");
        }
        const legit = await compare(password, findUser.password);
        if (!legit) {
            return res.status(401).send("wrong password try again bud");
        }
        const token = jwt.sign(
            { id: findUser.id, username: findUser.username },
            env.JWT_SECRET,
            { expiresIn: "15m" }
        )
        const refreshToken = jwt.sign(
            { id: findUser.id },
            env.JWT_SECRET,
            { expiresIn: "7d" }
        )
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 15
        })
        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7
        })
        res.send("user logged in");
    }
    catch (e) {
        return res.sendStatus(500);
    }
})

app.get("/refresh-token", async (req, res) => {
    try {
        const { refresh_token } = req.cookies;
        if (!refresh_token) {
            return res.status(400).send("no refresh token - please log in again")
        }
        const userPayload = jwt.verify(refresh_token, env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: userPayload.id } })
        if (!user) {
            return res.status(404).send("no user found what the fuck?");
        }
        const newToken = jwt.sign(
            { id: user.id, username: user.username },
            env.JWT_SECRET,
            { expiresIn: "15m" }
        )
        const newRefreshToken = jwt.sign(
            { id: user.id },
            env.JWT_SECRET,
            { expiresIn: "7d" }
        )
        res.cookie("token", newToken, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 15
        })
        res.cookie("refresh_token", newRefreshToken, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7
        })
        res.send("user logged in");
    }
    catch (e) {
        return res.sendStatus(500);
    }
})

const PORT = 3000;
const server = app.listen(PORT, () => {
    console.log("listening on port " + PORT)
})

const webSocketServer = new WebSocketServer({
    server: server, path: "/ws",
    verifyClient: async (info, callback) => {
        console.log("Person is trying to connect lmao");

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

            // Optional: attach user info to req if you want later access
            info.req.user = decoded;

            callback(true); // Accept the connection
        } catch (err) {
            console.error("JWT verification failed:", err.message);
            return callback(false, 401, "Invalid token");
        }
    }
});

webSocketServer.on("connection", newSocket => {
    console.log("user is authenticated now");
    newSocket.on("message", message => {
        webSocketServer.clients.forEach(client => {
            message = JSON.parse(message);
            client.send(JSON.stringify(message));
        })
    })
})

export { server };
