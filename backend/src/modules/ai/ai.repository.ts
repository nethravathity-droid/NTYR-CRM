import type { Knex } from "knex";
import type { AiConversationRecord } from "./ai.types.js";

export class AiRepository {
  constructor(private readonly db: Knex) {}

  async createConversation(data: {
    companyId: number;
    userId: number;
    title: string;
  }): Promise<AiConversationRecord> {
    const [row] = await this.db("ai_conversations")
      .insert({
        company_id: data.companyId,
        user_id: data.userId,
        title: data.title,
      })
      .returning("*");

    return row as AiConversationRecord;
  }

  async findConversationById(id: string, companyId: number): Promise<AiConversationRecord | null> {
    const conversation = await this.db<AiConversationRecord>("ai_conversations")
      .where({ id, company_id: companyId })
      .whereNull("deleted_at")
      .first();

    return conversation ?? null;
  }

  async listConversations(companyId: number, userId: number): Promise<AiConversationRecord[]> {
    const rows = await this.db<AiConversationRecord>("ai_conversations")
      .where({ company_id: companyId, user_id: userId })
      .whereNull("deleted_at")
      .orderBy("updated_at", "desc")
      .select("*");

    return rows;
  }

  async updateConversationTimestamp(id: string): Promise<void> {
    await this.db("ai_conversations")
      .where({ id })
      .update({ updated_at: this.db.fn.now() });
  }
}
