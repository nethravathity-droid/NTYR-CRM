import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./knex.js";

const schemaDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../database/schema",
);

// 016 already creates leads; 018 redefines it and fails when the table exists.
const SKIP_FILES = new Set(["018_create_leads_table.sql"]);

async function applySchema(): Promise<void> {
  console.log("Applying database schema...\n");

  const files = readdirSync(schemaDir)
    .filter((name) => name.endsWith(".sql") && !SKIP_FILES.has(name))
    .sort();

  for (const file of files) {
    console.log(`Applying ${file}...`);
    const sql = readFileSync(join(schemaDir, file), "utf8");
    await db.raw(sql);
    console.log("  OK");
  }

  console.log("\nSchema applied successfully.");
}

void applySchema()
  .catch((error) => {
    console.error("\nSchema apply failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });
