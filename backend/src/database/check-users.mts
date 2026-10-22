import "dotenv/config";
import knex from "knex";

const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
});

async function main() {
  const rows = await db("users")
    .select("id", "username", "official_email", "must_change_password", "status")
    .where("company_id", 2);
  console.table(rows);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.destroy());
