import knex, { type Knex } from "knex";
import { env } from "../config/env.js";

const connection: string | Knex.PgConnectionConfig = env.DATABASE_URL
  ? env.DATABASE_URL
  : {
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
    };

const config: Knex.Config = {
  client: "pg",
  connection,
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30_000,
    idleTimeoutMillis: 30_000,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: "../database/migrations",
  },
};

export const db = knex(config);
