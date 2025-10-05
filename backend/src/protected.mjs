import { Router } from "express";
import jwt from "jsonwebtoken";
import { env, prisma } from "./index.mjs";

const protectedRoutes = Router();

function verifyToken(req, res, next) {
    const { token } = req.cookies;
    if (!token) {
        return res.status(401).send("No token bro");
    }

    const reqUser = jwt.verify(token, env.JWT_SECRET);
    if (!reqUser) {
        return res.status(401).send("Not authorized");
    }

    req.user = reqUser;

    next();
}

protectedRoutes.use(verifyToken);

protectedRoutes.get("/dms/:user", async (req, res) => {
    try {
        const { user } = req.params;
        const reqUser = req.user;
        if (reqUser.username === user) {
            return res.status(400).send("fuck you");
        }

        const findUser = await prisma.user.findUnique({
            where: { username: user }
        });

        if (!findUser) {
            return res.status(404).send("User not found");
        }

        // Now fetch DMs *between* the two users only
        const dms = await prisma.dMMessage.findMany({
            where: {
                OR: [
                    {
                        senderId: reqUser.id,
                        receiverId: findUser.id
                    },
                    {
                        senderId: findUser.id,
                        receiverId: reqUser.id
                    }
                ]
            },
            orderBy: {
                createdAt: 'asc'
            },
            include: {
                sender: {
                    select: { username: true }
                },
                receiver: {
                    select: { username: true }
                }
            }
        });

        const dmsWithUsernames = dms.map(dm => ({
            id: dm.id,
            content: dm.content,
            createdAt: dm.createdAt,
            sender: dm.sender.username,
            receiver: dm.receiver.username
        }));

        res.json(dmsWithUsernames);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

protectedRoutes.get("/server-messages/:server", async (req, res) => {
    const { server } = req.params;

    const findServer = await prisma.server.findUnique({
        where: { name: server }
    });

    if (!findServer) {
        return res.status(404).send("server not found");
    }

    const messages = await prisma.serverMessage.findMany({
        where: { serverId: findServer.id },
        include: {
            sender: {
                select: {
                    username: true
                }
            }
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    const formattedMessages = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt,
        senderUsername: msg.sender.username
    }));

    return res.json(formattedMessages);
});

protectedRoutes.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true },
    });
    res.send(users);
  } catch (e) {
    console.error("Error fetching users:", e);
    res.status(500).send("error fetching users");
  }
});

protectedRoutes.get("/servers", async (req, res) => {
  try {
    const servers = await prisma.server.findMany({
      select: { id: true, name: true },
    });
    res.send(servers);
  } catch (e) {
    console.error("Error fetching servers:", e);
    res.status(500).send("error fetching servers");
  }
});


export { protectedRoutes };
