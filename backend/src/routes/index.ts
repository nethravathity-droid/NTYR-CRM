import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import companiesRoutes from "../modules/companies/companies.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";
import followupsRoutes from "../modules/followups/followup.routes.js";
import leadsRoutes from "../modules/leads/leads.routes.js";
import { projectsRouter, unitsRouter } from "../modules/properties/property.routes.js";
import usersRoutes from "../modules/users/users.routes.js";
import visitsRoutes from "../modules/visits/visit.routes.js";
import bookingsRoutes from "../modules/bookings/booking.routes.js";
import paymentsRoutes from "../modules/payments/payment.routes.js";
import reportsRoutes from "../modules/reports/reports.routes.js";
import callsRoutes from "../modules/calls/call.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/companies", companiesRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/users", usersRoutes);
router.use("/leads", leadsRoutes);
router.use("/followups", followupsRoutes);
router.use("/projects", projectsRouter);
router.use("/units", unitsRouter);
router.use("/visits", visitsRoutes);
router.use("/bookings", bookingsRoutes);
router.use("/payments", paymentsRoutes);
router.use("/reports", reportsRoutes);
router.use("/calls", callsRoutes);

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "CRM API Running",
    version: "1.0.0",
  });
});

export default router;
