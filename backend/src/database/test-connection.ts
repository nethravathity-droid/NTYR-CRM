import "dotenv/config";
import knex from "knex";

const connection = process.env.DATABASE_URL
  ? process.env.DATABASE_URL
  : {
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME ?? "postgres",
      user: process.env.DB_USER ?? "postgres",
      password: process.env.DB_PASSWORD,
    };

const db = knex({ client: "pg", connection });

const messages: Record<string, string> = {
  "28P01":
    "Password rejected by PostgreSQL. The DB_PASSWORD in backend/.env does not match the postgres user password.",
  "3D000":
    `Database "${process.env.DB_NAME}" does not exist. Create it in pgAdmin or run: CREATE DATABASE ${process.env.DB_NAME};`,
  ECONNREFUSED:
    "PostgreSQL is not running. Start the PostgreSQL service in Windows Services.",
};

async function testConnection(): Promise<void> {
  console.log("Testing database connection...");
  console.log(`  Host: ${process.env.DB_HOST ?? "localhost"}`);
  console.log(`  Port: ${process.env.DB_PORT ?? 5432}`);
  console.log(`  Database: ${process.env.DB_NAME}`);
  console.log(`  User: ${process.env.DB_USER ?? "postgres"}`);
  console.log("");

  try {
    await db.raw("SELECT 1");
    console.log("Connection successful.");
  } catch (error) {
    const code = (error as { code?: string }).code ?? "UNKNOWN";
    console.error("Connection failed.");
    console.error(`  Code: ${code}`);
    console.error(`  ${messages[code] ?? (error as Error).message}`);
    console.error("");
    console.error("Fix in pgAdmin (Query Tool on postgres database):");
    console.error("  ALTER USER postgres WITH PASSWORD 'your-chosen-password';");
    console.error("Then set the same value in backend/.env as DB_PASSWORD.");
    process.exitCode = 1;
  } finally {
    await db.destroy();
  }
}

void testConnection();
