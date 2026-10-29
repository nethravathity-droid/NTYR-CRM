
import "dotenv/config";
import knex from "knex";

const connection = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME ?? "postgres",
      user: process.env.DB_USER ?? "postgres",
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
    };

const db = knex({
  client: "pg",
  connection,
  pool: { min: 0, max: 1 },
});

async function testConnection(): Promise<void> {
  console.log("Testing database connection...");
  console.log(`  Host: ${process.env.DB_HOST ?? "(from DATABASE_URL)"}`);
  console.log(`  Port: ${process.env.DB_PORT ?? 5432}`);
  console.log(`  Database: ${process.env.DB_NAME}`);
  console.log(`  User: ${process.env.DB_USER ?? "(from DATABASE_URL)"}`);
  console.log("");

  try {
    const result = await db.raw(
      "SELECT current_database() AS database, current_user AS username",
    );
    console.log("Connection successful.");
    console.log("Connected database:", result.rows[0].database);
    console.log("Connected user:", result.rows[0].username);
  } catch (error) {
    const err = error as {
      code?: string;
      message?: string;
    };
    console.error("Connection failed.");
    console.error("Code:", err.code ?? "UNKNOWN");
    console.error("Error:", err.message ?? "Unknown error");
    process.exitCode = 1;
  } finally {
    await db.destroy();
  }
}

void testConnection();
