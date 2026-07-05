import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import companiesRoutes from "../modules/companies/companies.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";
import leadsRoutes from "../modules/leads/leads.routes.js";
import usersRoutes from "../modules/users/users.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/companies", companiesRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/users", usersRoutes);
router.use("/leads", leadsRoutes);

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "CRM API Running",
    version: "1.0.0",
  });
});

export default router;
