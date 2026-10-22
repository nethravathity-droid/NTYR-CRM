import "dotenv/config";
import knex from "knex";

const db = knex({
  client: "pg",
  connection: process.env.DATABASE_URL ?? {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
});

const checks = [
  ["enum user_status", "SELECT 1 FROM pg_type WHERE typname='user_status'"],
  ["table users", "SELECT 1 FROM pg_tables WHERE tablename='users'"],
  ["table roles", "SELECT 1 FROM pg_tables WHERE tablename='roles'"],
  ["table permissions", "SELECT 1 FROM pg_tables WHERE tablename='permissions'"],
  ["table companies", "SELECT 1 FROM pg_tables WHERE tablename='companies'"],
  ["table branches", "SELECT 1 FROM pg_tables WHERE tablename='branches'"],
  ["users.must_change_password", "SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='must_change_password'"],
];

for (const [label, sql] of checks) {
  const res = await db.raw(sql!);
  console.log(`${label}: ${res.rows.length > 0 ? "EXISTS" : "missing"}`);
}

const counts = await db.raw(
  "SELECT (SELECT count(*) FROM users) AS users, (SELECT count(*) FROM roles) AS roles, (SELECT count(*) FROM companies) AS companies",
);
console.log("counts:", counts.rows[0]);

const companyRows = await db.raw(
  "SELECT company_code, company_name, status FROM companies ORDER BY id",
);
console.log("companies:");
for (const row of companyRows.rows) {
  console.log(`  ${row.company_code.padEnd(20)} ${row.company_name.padEnd(35)} ${row.status}`);
}

await db.destroy();
