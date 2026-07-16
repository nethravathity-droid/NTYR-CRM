import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./knex.js";

const schemaDir = join(dirname(fileURLToPath(import.meta.url)), "../../../database/schema");
const PAYMENT_FILES = ["029_create_payments_table.sql", "030_create_payment_audit_logs_table.sql"];

async function applyPaymentsSchema(): Promise<void> {
  console.log("Applying payments schema...\n");
  for (const file of PAYMENT_FILES) {
    console.log(`Applying ${file}...`);
    await db.raw(readFileSync(join(schemaDir, file), "utf8"));
    console.log("  OK");
  }
  console.log("\nPayments schema applied successfully.");
}

void applyPaymentsSchema()
  .catch((error) => {
    console.error("\nPayments schema apply failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });
