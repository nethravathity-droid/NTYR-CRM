import { Link } from "react-router-dom";
import {
  Calendar,
  Filter,
  FormInput,
  Inbox,
  Megaphone,
  Sparkles,
  Star,
  Workflow,
  FileText,
} from "lucide-react";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { useGrowthHub } from "@/features/growth/hooks/useGrowth";
import { GROWTH_SECTION_LABELS, type GrowthSection } from "@/features/growth/types/growth.types";
import { paths } from "@/routes/paths";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";

const SECTION_META: Record<
  GrowthSection,
  { icon: typeof Megaphone; description: string; zoho: string; ghl: string }
> = {
  templates: {
    icon: FileText,
    description: "Email, SMS, and WhatsApp templates",
    zoho: "Email / SMS templates",
    ghl: "Templates & snippets",
  },
  campaigns: {
    icon: Megaphone,
    description: "Broadcast campaigns to lead segments",
    zoho: "Campaigns",
    ghl: "Email & SMS campaigns",
  },
  workflows: {
    icon: Workflow,
    description: "Trigger-based automations",
    zoho: "Workflow rules",
    ghl: "Workflows",
  },
  forms: {
    icon: FormInput,
    description: "Embeddable lead capture forms",
    zoho: "Web forms",
    ghl: "Forms & surveys",
  },
  funnels: {
    icon: Filter,
    description: "Multi-step funnel stages",
    zoho: "Blueprint stages",
    ghl: "Funnels / pipelines",
  },
  appointments: {
    icon: Calendar,
    description: "Booking calendar for sales",
    zoho: "Meetings",
    ghl: "Calendars",
  },
  reviews: {
    icon: Star,
    description: "Reputation and review tracking",
    zoho: "—",
    ghl: "Reputation management",
  },
  inbox: {
    icon: Inbox,
    description: "WhatsApp, SMS, and email threads",
    zoho: "Omni-channel",
    ghl: "Conversations",
  },
};

export function GrowthHubPage() {
  const { data, isLoading } = useGrowthHub();

  if (isLoading) return <Loading label="Loading growth hub..." />;

  const counts: Partial<Record<GrowthSection, number>> = {
    templates: data?.templates,
    campaigns: data?.campaigns,
    workflows: data?.workflows,
    forms: data?.forms,
    funnels: data?.funnels,
    appointments: data?.appointments,
    reviews: data?.reviews,
  };

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={Sparkles}
        tone="violet"
        title="Growth & marketing"
        description="Zoho CRM + GoHighLevel-style tools: campaigns, automations, forms, funnels, calendar, reputation, and unified inbox."
      />

      <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-lg">Platform parity</CardTitle>
          <CardDescription>
            Core GHL/Zoho capabilities are available here.             Campaigns use templates and deliver WhatsApp via your CRM inbox; SMS/email queue in outreach until
            you connect a provider. Workflows run automatically when leads are created (status Active).
          </CardDescription>
        </CardHeader>
        {data?.averageRating != null && (
          <CardContent className="text-sm text-muted-foreground">
            Average published rating: <strong>{data.averageRating.toFixed(1)}</strong> / 5
          </CardContent>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(SECTION_META) as GrowthSection[]).map((section) => {
          const meta = SECTION_META[section];
          const Icon = meta.icon;
          const count = counts[section];
          return (
            <Link key={section} to={paths.growth.section(section)} className="block">
              <Card className="h-full transition hover:border-primary/40 hover:shadow-md">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{GROWTH_SECTION_LABELS[section]}</CardTitle>
                    <CardDescription className="mt-1">{meta.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Zoho: {meta.zoho} · GHL: {meta.ghl}</span>
                  {count !== undefined && section !== "inbox" ? <span>{count} items</span> : null}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
