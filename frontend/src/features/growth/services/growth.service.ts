import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type { GrowthHubSummary } from "@/features/growth/types/growth.types";

export async function getGrowthHub(): Promise<GrowthHubSummary> {
  const response = await apiClient.get<ApiResponse<GrowthHubSummary>>("/growth/hub");
  return response.data.data;
}

export async function listGrowthResource<T>(
  section: string,
  params?: Record<string, string | number | undefined>,
): Promise<{ items: T[]; total: number }> {
  const response = await apiClient.get<ApiResponse<{ items: T[]; total: number }>>(`/growth/${section}`, {
    params,
  });
  return response.data.data;
}

export async function createGrowthResource<T>(section: string, body: Record<string, unknown>): Promise<T> {
  const key = section === "templates" ? "template" : section.slice(0, -1);
  const response = await apiClient.post<ApiResponse<Record<string, T>>>(`/growth/${section}`, body);
  const data = response.data.data;
  return (data[key] ?? data[section.slice(0, -1)] ?? Object.values(data)[0]) as T;
}

export async function runCampaign(uuid: string): Promise<{ sent: number; audienceSize: number }> {
  const response = await apiClient.post<ApiResponse<{ sent: number; audienceSize: number }>>(
    `/growth/campaigns/${uuid}/run`,
  );
  return response.data.data;
}

export async function listInboxThreads(params?: { channel?: string; limit?: number }) {
  const response = await apiClient.get<ApiResponse<{ threads: unknown[] }>>("/growth/inbox", { params });
  return response.data.data.threads;
}

export async function getInboxThreadMessages(channel: string, recipient: string) {
  const response = await apiClient.get<ApiResponse<{ messages: InboxMessage[] }>>("/growth/inbox/thread", {
    params: { channel, recipient },
  });
  return response.data.data.messages;
}

export async function replyInbox(body: {
  channel: string;
  recipient: string;
  body: string;
  customerName: string;
  leadUuid?: string | null;
}) {
  const response = await apiClient.post<ApiResponse<{ status: string }>>("/growth/inbox/reply", body);
  return response.data.data;
}

export type InboxMessage = {
  uuid: string;
  channel: string;
  direction: string;
  body: string;
  status: string;
  createdAt: string;
};

export type InboxThread = {
  key: string;
  channel: string;
  recipient: string;
  customerName: string | null;
  leadUuid: string | null;
  lastMessage: string;
  lastAt: string;
};

export async function getPublicForm(uuid: string) {
  const response = await apiClient.get<ApiResponse<{ form: { name: string; fields: unknown[] } }>>(
    `/growth/public/forms/${uuid}`,
  );
  return response.data.data.form;
}

export async function submitPublicForm(uuid: string, payload: Record<string, unknown>) {
  const response = await apiClient.post<ApiResponse<{ leadUuid: string }>>(
    `/growth/public/forms/${uuid}/submit`,
    payload,
  );
  return response.data.data;
}
