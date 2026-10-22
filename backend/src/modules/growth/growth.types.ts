export type TemplateChannel = "EMAIL" | "SMS" | "WHATSAPP";

export type MessageTemplate = {
  uuid: string;
  name: string;
  channel: TemplateChannel;
  subject: string | null;
  body: string;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
};

export type MarketingCampaign = {
  uuid: string;
  name: string;
  channel: TemplateChannel;
  templateUuid: string | null;
  audienceFilter: Record<string, unknown>;
  status: "DRAFT" | "SCHEDULED" | "RUNNING" | "COMPLETED" | "CANCELLED";
  scheduledAt: string | null;
  sentCount: number;
  createdAt: string;
};

export type AutomationWorkflow = {
  uuid: string;
  name: string;
  description: string | null;
  triggerType: string;
  triggerConfig: Record<string, unknown>;
  actions: unknown[];
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";
  runCount: number;
  createdAt: string;
};

export type WebForm = {
  uuid: string;
  name: string;
  slug: string;
  fields: unknown[];
  settings: Record<string, unknown>;
  submissionCount: number;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: string;
};

export type SalesFunnel = {
  uuid: string;
  name: string;
  description: string | null;
  stages: unknown[];
  status: "ACTIVE" | "ARCHIVED";
  createdAt: string;
};

export type ScheduledAppointment = {
  uuid: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  leadUuid: string | null;
  assignedUserUuid: string | null;
  location: string | null;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  createdAt: string;
};

export type ReputationReview = {
  uuid: string;
  reviewerName: string;
  reviewerEmail: string | null;
  rating: number;
  reviewText: string | null;
  source: string;
  status: "PUBLISHED" | "HIDDEN" | "PENDING";
  leadUuid: string | null;
  createdAt: string;
};

export type InboxThread = {
  key: string;
  channel: TemplateChannel;
  recipient: string;
  customerName: string | null;
  leadUuid: string | null;
  lastMessage: string;
  lastAt: string;
  unreadCount: number;
};

export type GrowthHubSummary = {
  templates: number;
  campaigns: number;
  workflows: number;
  forms: number;
  funnels: number;
  appointments: number;
  reviews: number;
  averageRating: number | null;
};
