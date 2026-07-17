import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { getUploadsRoot } from "./common/utils/uploads.js";
import { errorHandler } from "./common/middleware/errorHandler.js";
import { notFoundHandler } from "./common/middleware/notFound.js";
import routes from "./routes/index.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
const allowedOrigins =
  env.CORS_ORIGIN === "*"
    ? true
    : env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(compression());

if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  // SPA dashboards fire many parallel queries on load; use a generous cap in development.
  max: env.NODE_ENV === "development" ? Math.max(env.RATE_LIMIT_MAX, 2_000) : env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

app.use("/api/v1", apiLimiter);
app.use("/uploads", express.static(getUploadsRoot()));
app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
