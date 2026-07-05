import "dotenv/config";
import knex from "knex";

const connection = process.env.DATABASE_URL
  ? process.env.DATABASE_URL
  : {
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };

export const seedDb = knex({
  client: "pg",
  connection,
});

export const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 12);
