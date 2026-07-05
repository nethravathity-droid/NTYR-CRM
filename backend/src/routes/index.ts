import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import usersRoutes from "../modules/users/users.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "CRM API Running",
    version: "1.0.0",
  });
});

export default router;
