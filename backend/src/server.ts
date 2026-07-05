import app from "./app.js";
import { env } from "./config/env.js";
import { db } from "./database/knex.js";

const SHUTDOWN_TIMEOUT_MS = 10_000;

const server = app.listen(env.PORT, () => {
  console.log(
    `Server listening on port ${env.PORT} [${env.NODE_ENV}]`,
  );
});

const shutdown = (signal: string): void => {
  console.log(`${signal} received. Starting graceful shutdown...`);

  const forceExitTimer = setTimeout(() => {
    console.error("Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  forceExitTimer.unref();

  server.close(async () => {
    try {
      await db.destroy();
      console.log("HTTP server closed. Database connections destroyed.");
      process.exit(0);
    } catch (error) {
      console.error("Error during graceful shutdown:", error);
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  shutdown("uncaughtException");
});
