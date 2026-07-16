export async function up(knex) {
  await knex.schema.createTable("followups", (table) => {
    table.increments("id").primary();
    table.uuid("uuid").notNullable().unique().defaultTo(knex.raw("gen_random_uuid()"));
    table.integer("company_id").notNullable().references("id").inTable("companies").onDelete("CASCADE");
    table.integer("lead_id").references("id").inTable("leads").onDelete("SET NULL");
    table.string("customer_name", 200).notNullable();
    table.integer("assigned_user_id").references("id").inTable("users").onDelete("SET NULL");
    table.date("followup_date").notNullable();
    table.time("followup_time").notNullable();
    table.enu("followup_type", ["CALL", "WHATSAPP", "EMAIL", "MEETING", "SITE_VISIT"]).notNullable();
    table.enu("priority", ["HIGH", "MEDIUM", "LOW"]).notNullable().defaultTo("MEDIUM");
    table.enu("status", ["PENDING", "COMPLETED", "MISSED", "RESCHEDULED"]).notNullable().defaultTo("PENDING");
    table.text("notes");
    table.integer("reminder_before").notNullable().defaultTo(30);
    table.date("next_followup_date");
    table.integer("created_by").references("id").inTable("users").onDelete("SET NULL");
    table.integer("updated_by").references("id").inTable("users").onDelete("SET NULL");
    table.integer("deleted_by").references("id").inTable("users").onDelete("SET NULL");
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("deleted_at");
    table.index(["company_id", "followup_date", "status"]);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("followups");
}
