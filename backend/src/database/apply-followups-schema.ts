import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./knex.js";

const schemaPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../database/schema/019_create_followups_table.sql",
);

async function applyFollowupsSchema(): Promise<void> {
  console.log("Applying followups schema...");
  const sql = readFileSync(schemaPath, "utf8");
  await db.raw(sql);
  console.log("Followups schema applied successfully.");
}

void applyFollowupsSchema()
  .catch((error) => {
    console.error("Followups schema apply failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });
