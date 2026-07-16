import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./knex.js";

const schemaDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../database/schema",
);

const PROPERTY_FILES = [
  "020_create_projects_table.sql",
  "021_create_towers_table.sql",
  "022_create_floors_table.sql",
  "023_create_units_table.sql",
];

async function applyPropertiesSchema(): Promise<void> {
  console.log("Applying property & inventory schema...\n");

  for (const file of PROPERTY_FILES) {
    console.log(`Applying ${file}...`);
    const sql = readFileSync(join(schemaDir, file), "utf8");
    await db.raw(sql);
    console.log("  OK");
  }

  console.log("\nProperty schema applied successfully.");
}

void applyPropertiesSchema()
  .catch((error) => {
    console.error("\nProperty schema apply failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });
