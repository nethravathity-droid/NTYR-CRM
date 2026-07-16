import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./knex.js";

const schemaDir = join(dirname(fileURLToPath(import.meta.url)), "../../../database/schema");
const CALL_FILES = ["031_create_calls_table.sql", "032_create_call_audit_logs_table.sql"];

async function applyCallsSchema(): Promise<void> {
  console.log("Applying calls schema...\n");
  for (const file of CALL_FILES) {
    console.log(`Applying ${file}...`);
    await db.raw(readFileSync(join(schemaDir, file), "utf8"));
    console.log("  OK");
  }
  console.log("\nCalls schema applied successfully.");
}

void applyCallsSchema()
  .catch((error) => {
    console.error("\nCalls schema apply failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });
