import { prisma, userToSocket } from "./index.mjs";
import jwt from "jsonwebtoken";
import { env } from "process";

function createMessage(type, message) {
    return JSON.stringify({
        ...message,
        type: type
    })
}

function createErrorMessage(message) {
    return JSON.stringify({
        type: "error",
        message: message
    })
}

async function handleDm(payload, socket, req) {
    const { content, receiver } = payload;
    const senderUsername = req.user.username;
    const findRecipient = await prisma.user.findUnique({ where: { username: receiver } });
    if (findRecipient) {
        const createDMMessage = await prisma.dMMessage.create({
            data: {
                content: content,
                sender: { connect: { username: senderUsername } },
                receiver: { connect: { username: receiver } }
            },
            include: {
                sender: {
                    select: {
                        username: true
                    }
                },
                receiver: {
                    select: {
                        username: true
                    }
                }
            }
        })
        console.log(createDMMessage);
        if (userToSocket.has(findRecipient.id)) {
            const receipientSocket = userToSocket.get(findRecipient.id);
            console.log("find user socket", receipientSocket);
            receipientSocket.send(createMessage("dm", createDMMessage));
        }
        socket.send(createMessage("dm", createDMMessage));
    }
}

async function handleServerCreate(payload, socket) {
    const { serverName, owner } = payload;
    console.log(payload);
    const findUser = await prisma.user.findUnique({ where: { username: owner } });
    if (findUser) {
        const findServer = await prisma.server.findUnique({ where: {name: serverName}});
        if (!findServer) {
            const server = await prisma.server.create({
                data: {
                    name: serverName,
                    owner: { connect: {username: owner} },
                    members: { connect: [{ id: findUser.id }] }
                }
            })
            console.log(server);
            socket.send(JSON.stringify({...server, type: "server-create"})); // TODO: non-standard response
            console.log("NEW SERVER CREATED")
        }
        else {
            socket.send(createErrorMessage("409 server already exists"))
        }
    }
    else {
        socket.send(createErrorMessage("404 owner not found"));
    }
}

async function handleServerMessage(payload, socket, req) {
    const { content, server } = payload;
    const senderUsername = req.user.username
    const findServer = await prisma.server.findUnique({
        where: {
            name: server
        },
        include: {
            members: true
        }
    });
    if (findServer) {
        await prisma.serverMessage.create({
            data: {
                content: content,
                server: {connect: { id: findServer.id }},
                sender: {connect: { username: senderUsername }}
            },
            include: {
                sender: {
                    select: {
                        username: true
                    }
                }
            }
        })
        console.log(findServer.members)
        findServer.members.forEach(member => {
            console.log(member.username);
            if (userToSocket.has(member.id)) {
                const userSocket = userToSocket.get(member.id);
                userSocket.send(createMessage("server", {
                    sender: senderUsername,
                    content: content,
                    server: findServer.name
                }));
            }
        })
    }
    else {
        socket.send(createErrorMessage("404 server not found"))
    }
}

const verifyClientFunction = async (info, callback) => {
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

        callback(true);
    } catch (err) {
        console.error("JWT verification failed:", err.message);
        return callback(false, 401, "Invalid token");
    }
}

async function handleServerJoin(payload, socket) {
    const { username, serverName } = payload;
    const findUser = await prisma.user.findUnique({ where: { username: username } });
    if (!findUser) {
        return socket.send(createErrorMessage("404 user not found"));
    }
    const findServer = await prisma.server.findUnique({
        where: { name: serverName },
        include: { members: true }
    });
    if (!findServer) {
        return socket.send(createErrorMessage("404 server not found"));
    }
    const alreadyMember = findServer.members.some(member => member.id === findUser.id);
    if (alreadyMember) {
        return socket.send(createErrorMessage("409 user already in server"));
    }
    await prisma.server.update({
        where: { id: findServer.id },
        data: {
            members: {
                connect: { id: findUser.id }
            }
        }
    });
    // TODO: non-standard socket.send() call
    socket.send(JSON.stringify({
        type: "server-join",
        message: `User '${username}' joined server '${serverName}'`
    }));
}

export {
    handleDm, handleServerMessage, handleServerCreate, handleServerJoin,
    verifyClientFunction,
}
