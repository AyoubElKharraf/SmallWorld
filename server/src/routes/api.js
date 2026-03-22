import { Router } from "express";
import publicRouter from "./public.js";
import authRouter from "./auth.js";
import notificationsRouter from "./notifications.js";
import adminRouter from "./admin.js";
import { authLimiter } from "../middleware/security.js";

const router = Router();

router.use(publicRouter);
router.use("/auth", authLimiter, authRouter);
router.use("/notifications", notificationsRouter);
router.use("/admin", adminRouter);

export default router;
