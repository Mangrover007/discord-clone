import { Router } from "express";
import { authRouter } from "./auth.mjs";
import { protectedRoutes } from "./protected.mjs";

const router = Router();

router.use("/auth",authRouter)
router.use(protectedRoutes)

export { router };
