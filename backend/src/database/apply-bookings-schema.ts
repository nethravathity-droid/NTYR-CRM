import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./knex.js";

const schemaDir = join(dirname(fileURLToPath(import.meta.url)), "../../../database/schema");
const BOOKING_FILES = [
  "026_create_bookings_table.sql",
  "027_create_booking_documents_table.sql",
  "028_create_booking_audit_logs_table.sql",
];

async function applyBookingsSchema(): Promise<void> {
  console.log("Applying bookings schema...\n");
  for (const file of BOOKING_FILES) {
    console.log(`Applying ${file}...`);
    await db.raw(readFileSync(join(schemaDir, file), "utf8"));
    console.log("  OK");
  }
  console.log("\nBookings schema applied successfully.");
}

void applyBookingsSchema()
  .catch((error) => {
    console.error("\nBookings schema apply failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });
