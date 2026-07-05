import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "CRM API Running",
    version: "1.0.0",
  });
});

export default router;
