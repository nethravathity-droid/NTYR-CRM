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

export type GrowthSection =
  | "templates"
  | "campaigns"
  | "workflows"
  | "forms"
  | "funnels"
  | "appointments"
  | "reviews"
  | "inbox";

export const GROWTH_SECTION_LABELS: Record<GrowthSection, string> = {
  templates: "Message templates",
  campaigns: "Campaigns",
  workflows: "Automations",
  forms: "Lead capture forms",
  funnels: "Funnels",
  appointments: "Appointments",
  reviews: "Reviews & reputation",
  inbox: "Unified inbox",
};
