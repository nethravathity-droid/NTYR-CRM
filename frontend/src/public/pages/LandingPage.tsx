import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CalendarDays, Mail, Phone, Settings2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_NAME, APP_DESCRIPTION } from "@/config/branding";
import { AutomationSection } from "@/public/components/AutomationSection";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const FEATURES = [
  {
    icon: Users,
    title: "Lead Management",
    description: "Capture, score, and assign leads automatically. Never miss a follow-up.",
  },
  {
    icon: BarChart3,
    title: "Sales Pipeline",
    description: "Visualize deals, forecast revenue, and move opportunities forward.",
  },
  {
    icon: Mail,
    title: "Communication",
    description: "Email, WhatsApp, SMS, and calls unified in one customer timeline.",
  },
  {
    icon: CalendarDays,
    title: "Calendar & Tasks",
    description: "Appointments, reminders, and team schedules in one place.",
  },
  {
    icon: Settings2,
    title: "Automation",
    description: "Workflows, triggers, and actions that work while you sleep.",
  },
  {
    icon: Phone,
    title: "Analytics",
    description: "Revenue, conversion, and team performance at a glance.",
  },
];

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useScrollReveal();
  return <div ref={ref} className={className}>{children}</div>;
}

export function LandingPage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Your Entire Business.
                <br />
                <span className="text-primary">One Powerful CRM.</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                {APP_DESCRIPTION}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/register">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/contact">Book a Demo</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                No credit card required · 14-day free trial · Set up in minutes
              </p>
            </div>
            <div className="relative">
              <div className="rounded-2xl border bg-background shadow-2xl">
                <div className="border-b bg-muted/20 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-xs text-muted-foreground">
                      {APP_NAME} Dashboard
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 p-6">
                  {["Revenue", "Leads", "Deals", "Tasks", "Calls", "Reports"].map(
                    (label) => (
                      <Card key={label} className="p-4">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="mt-1 text-2xl font-bold">—</p>
                      </Card>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-center text-lg font-medium">
              Everything you need to turn leads into customers.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Reveal key={feature.title}>
                <Card className="h-full p-6">
                  <feature.icon className="h-8 w-8 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                One platform. Every customer interaction.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                From first contact to closed deal — and everything after.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "CRM & Contacts",
              "Lead Management",
              "Sales Pipeline",
              "Communication",
              "Calendar & Tasks",
              "Automation",
              "Marketing",
              "Analytics",
            ].map((feature) => (
              <Reveal key={feature}>
                <Card className="p-6 text-center">
                  <h3 className="font-semibold">{feature}</h3>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Built for the way YOUR business works.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Real Estate, Agencies, Education, Healthcare, Finance, and more.
              </p>
            </div>
          </Reveal>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {[
              "Real Estate",
              "Agencies",
              "Education",
              "Healthcare",
              "Finance",
              "Automotive",
              "Professional Services",
              "SaaS",
              "E-commerce",
              "Consulting",
              "More",
            ].map((industry) => (
              <Reveal key={industry}>
                <span className="rounded-full border bg-background px-4 py-2 text-sm font-medium">
                  {industry}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Make the CRM fit your business.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Custom fields, pipelines, stages, roles, workflows, and reports.
              </p>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Custom Fields",
              "Custom Pipelines",
              "Custom Stages",
              "Custom Objects",
              "Custom Statuses",
              "Custom Roles",
              "Custom Workflows",
              "Custom Reports",
            ].map((item) => (
              <Reveal key={item}>
                <Card className="p-4 text-center text-sm font-medium">
                  {item}
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Secure multi-tenant architecture.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Role-based access, permission management, workspace isolation, and audit logs.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <AutomationSection />

      <section className="border-t">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to grow your business?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Set up your workspace and start managing your business from one place.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">Book a Demo</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
