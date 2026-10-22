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

function collectSqlFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSqlFiles(fullPath));
    } else if (entry.name.endsWith(".sql") && !SKIP_FILES.has(entry.name)) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

async function applySchema(): Promise<void> {
  console.log("Applying database schema...\n");

  const files = collectSqlFiles(schemaDir);

  for (const file of files) {
    const relative = file.replace(schemaDir, "").replace(/^\\/, "").replace(/^\//, "");
    console.log(`Applying ${relative}...`);
    const sql = readFileSync(file, "utf8");
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
