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
            senderUsername: dm.sender.username,
            receiverUsername: dm.receiver.username
        }));

        res.json(dmsWithUsernames);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

export { protectedRoutes };
