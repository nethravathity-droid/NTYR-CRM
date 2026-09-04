import { db } from "../../database/knex.js";
import { randomUUID } from "node:crypto";
import { AppError } from "../../common/errors/AppError.js";
import { AiRepository } from "./ai.repository.js";
import type { AiChatResponse, AiChatRequest, AiConversationRecord } from "./ai.types.js";

export class AiService {
  constructor(private readonly aiRepository: AiRepository) {}

  async chat(input: AiChatRequest, companyId: number, userId: number): Promise<AiChatResponse> {
    let conversationId = input.conversationId;

    if (!conversationId) {
      const conversation = await this.aiRepository.createConversation({
        companyId,
        userId,
        title: input.message.slice(0, 100),
      });
      conversationId = conversation.id;
    } else {
      const conversation = await this.aiRepository.findConversationById(conversationId, companyId);
      if (!conversation) {
        throw new AppError(404, "Conversation not found");
      }
    }

    await this.aiRepository.updateConversationTimestamp(conversationId);

    const responseContent = await this.generateResponse(input.message);

    return {
      conversationId,
      message: {
        id: randomUUID(),
        role: "assistant",
        content: responseContent,
        createdAt: new Date().toISOString(),
      },
      suggestions: ["Show my leads", "Today's follow-ups", "Revenue this month"],
    };
  }

  async listConversations(companyId: number, userId: number): Promise<AiConversationRecord[]> {
    return this.aiRepository.listConversations(companyId, userId);
  }

  private async generateResponse(message: string): Promise<string> {
    const normalized = message.toLowerCase().trim();

    if (normalized.includes("lead") && normalized.includes("show")) {
      return "I can help you view leads. Go to the Leads section to see all your leads, or ask me about lead status, assignment, or follow-ups.";
    }

    if (normalized.includes("follow") || normalized.includes("follow-up")) {
      return "You have follow-ups scheduled. Check the Follow-ups section for today's tasks, overdue follow-ups, and calendar view.";
    }

    if (normalized.includes("revenue") || normalized.includes("sales") || normalized.includes("collection")) {
      return "For revenue and sales insights, check the Reports section. You can view daily, monthly, and employee-wise performance there.";
    }

    if (normalized.includes("employee") || normalized.includes("team")) {
      return "You can manage your team in the Employees section. View performance, assign leads, and track activities there.";
    }

    if (normalized.includes("booking") || normalized.includes("visit")) {
      return "Bookings and visits are available in their respective sections. Check the dashboard for pending approvals and upcoming visits.";
    }

    if (normalized.includes("payment") || normalized.includes("due")) {
      return "Payment details, outstanding amounts, and schedules are available in the Payments section.";
    }

    if (normalized.includes("hello") || normalized.includes("hi") || normalized.includes("hey")) {
      return "Hello! I'm your CRM assistant. I can help you with leads, follow-ups, reports, payments, and more. What would you like to know?";
    }

    if (normalized.includes("thank")) {
      return "You're welcome! Let me know if you need anything else.";
    }

    return "I understand you're asking about \"" + message + "\". For detailed information, please check the relevant section in your dashboard, or ask me about leads, follow-ups, reports, payments, or team performance.";
  }
}

export const aiService = new AiService(new AiRepository(db));
