import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CalendarDays, Mail, Phone, Settings2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_DESCRIPTION } from "@/config/branding";

const FEATURES = [
  {
    icon: Users,
    title: "CRM & Contacts",
    description:
      "Centralized customer database with custom fields, tags, customer timeline, notes, and activities.",
  },
  {
    icon: BarChart3,
    title: "Lead Management",
    description:
      "Capture leads, assign automatically, score, track sources, manage follow-ups, and update status.",
  },
  {
    icon: Settings2,
    title: "Sales Pipeline",
    description:
      "Multiple pipelines, custom stages, drag-and-drop deals, deal values, and forecasting.",
  },
  {
    icon: Mail,
    title: "Communication",
    description:
      "Email, WhatsApp, SMS, and calling unified in one customer conversation timeline.",
  },
  {
    icon: CalendarDays,
    title: "Calendar & Tasks",
    description:
      "Appointments, follow-ups, tasks, reminders, and team calendars.",
  },
  {
    icon: Phone,
    title: "Automation",
    description:
      "Workflow builder with triggers, conditions, actions, automated follow-ups, and notifications.",
  },
  {
    icon: Users,
    title: "Marketing",
    description:
      "Campaigns, forms, landing pages, lead sources, email campaigns, and funnels.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Revenue, conversion, pipeline, employee performance, campaign performance, and custom reports.",
  },
];

export function FeaturesPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Features
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            {APP_DESCRIPTION}
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="p-6">
              <feature.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Button size="lg" asChild>
            <Link to="/register">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
