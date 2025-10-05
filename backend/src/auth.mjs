import { Router } from "express";
import { env, prisma } from "./index.mjs";
import { hash, compare } from "bcryptjs"
import jwt from "jsonwebtoken";

const authRouter = Router();

authRouter.post("/register", async (req, res) => {
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

authRouter.post("/login", async (req, res) => {
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
        console.log("login error", e)
        return res.sendStatus(500);
    }
})

authRouter.get("/refresh-token", async (req, res) => {
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

authRouter.get("/me", async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).send("no token");

  try {
    const userPayload = jwt.verify(token, env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: userPayload.id },
      select: { id: true, username: true },
    });
    if (!user) return res.status(404).send("user not found");
    res.json(user);
  } catch (e) {
    res.status(401).send("invalid token");
  }
});


export { authRouter };
