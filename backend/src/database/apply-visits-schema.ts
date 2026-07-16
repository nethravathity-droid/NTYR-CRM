import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./knex.js";

const schemaDir = join(dirname(fileURLToPath(import.meta.url)), "../../../database/schema");
const VISIT_FILES = ["024_create_site_visits_table.sql", "025_create_visit_audit_logs_table.sql"];

async function applyVisitsSchema(): Promise<void> {
  console.log("Applying site visits schema...\n");
  for (const file of VISIT_FILES) {
    console.log(`Applying ${file}...`);
    await db.raw(readFileSync(join(schemaDir, file), "utf8"));
    console.log("  OK");
  }
  console.log("\nSite visits schema applied successfully.");
}

void applyVisitsSchema()
  .catch((error) => {
    console.error("\nSite visits schema apply failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });
