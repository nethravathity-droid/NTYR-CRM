import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Gauge,
  IndianRupee,
  Layers3,
  LineChart,
  MessageSquare,
  PhoneCall,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  UserSquare2,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_DESCRIPTION } from "@/config/branding";
import { AutomationSection } from "@/public/components/AutomationSection";
import { PipelineSection } from "@/public/components/PipelineSection";
import { CommunicationSection } from "@/public/components/CommunicationSection";
import { AnalyticsSection } from "@/public/components/AnalyticsSection";
import { LandingIconCard, LandingPill } from "@/public/components/LandingIconCard";
import { IconBox } from "@/features/companies/components/IconBox";
import type { IconBoxTone } from "@/features/companies/components/IconBox";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const FEATURES: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
  tone: IconBoxTone;
}> = [
  {
    icon: UserSquare2,
    title: "Lead Management",
    description: "Capture, score, assign, and follow up — without leads slipping through.",
    tone: "indigo",
  },
  {
    icon: Target,
    title: "Sales Pipeline",
    description: "Visualize deals, forecast revenue, and move opportunities forward.",
    tone: "violet",
  },
  {
    icon: MessageSquare,
    title: "Communication",
    description: "WhatsApp, calls, email, and notes in one customer timeline.",
    tone: "emerald",
  },
  {
    icon: CalendarClock,
    title: "Calendar & Tasks",
    description: "Site visits, follow-ups, and team schedules in one place.",
    tone: "cyan",
  },
  {
    icon: Workflow,
    title: "Automation",
    description: "Workflows and reminders that keep your team on track.",
    tone: "amber",
  },
  {
    icon: LineChart,
    title: "Analytics",
    description: "Revenue, conversion, and team performance at a glance.",
    tone: "blue",
  },
];

const PLATFORM: Array<{ icon: LucideIcon; title: string; tone: IconBoxTone }> = [
  { icon: Users, title: "CRM & Contacts", tone: "indigo" },
  { icon: UserSquare2, title: "Lead Management", tone: "violet" },
  { icon: Target, title: "Sales Pipeline", tone: "emerald" },
  { icon: MessageSquare, title: "Communication", tone: "cyan" },
  { icon: CalendarClock, title: "Calendar & Tasks", tone: "amber" },
  { icon: Zap, title: "Automation", tone: "rose" },
  { icon: Sparkles, title: "Marketing", tone: "violet" },
  { icon: BarChart3, title: "Analytics", tone: "blue" },
];

const CUSTOMIZATION: Array<{ icon: LucideIcon; title: string }> = [
  { icon: SlidersHorizontal, title: "Custom Fields" },
  { icon: Layers3, title: "Custom Pipelines" },
  { icon: Gauge, title: "Custom Stages" },
  { icon: Building2, title: "Custom Objects" },
  { icon: CheckCircle2, title: "Custom Statuses" },
  { icon: ShieldCheck, title: "Custom Roles" },
  { icon: Workflow, title: "Custom Workflows" },
  { icon: LineChart, title: "Custom Reports" },
];

const INDUSTRIES: Array<{ icon: LucideIcon; label: string }> = [
  { icon: Building2, label: "Real Estate" },
  { icon: Users, label: "Agencies" },
  { icon: Sparkles, label: "Education" },
  { icon: ShieldCheck, label: "Healthcare" },
  { icon: IndianRupee, label: "Finance" },
  { icon: Gauge, label: "Automotive" },
  { icon: Layers3, label: "Professional Services" },
  { icon: Zap, label: "SaaS" },
  { icon: CreditCard, label: "E-commerce" },
  { icon: Target, label: "Consulting" },
];

const HERO_METRICS: Array<{
  label: string;
  value: string;
  icon: LucideIcon;
  tone: IconBoxTone;
}> = [
  { label: "Revenue", value: "₹2.4Cr", icon: IndianRupee, tone: "emerald" },
  { label: "Active Leads", value: "248", icon: UserSquare2, tone: "indigo" },
  { label: "Bookings", value: "36", icon: CreditCard, tone: "violet" },
  { label: "Follow-ups", value: "18", icon: CalendarClock, tone: "amber" },
  { label: "Calls Today", value: "42", icon: PhoneCall, tone: "cyan" },
  { label: "Conversion", value: "24%", icon: LineChart, tone: "blue" },
];

const TRUST_POINTS = [
  "14-day free trial",
  "No credit card required",
  "Multi-tenant & role-based access",
  "Built for Indian real estate teams",
];

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useScrollReveal();
  return <div ref={ref} className={className}>{children}</div>;
}

export function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,hsl(var(--primary)/0.18),transparent)]" />
          <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,hsl(var(--background)))]" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                Premium CRM for growing teams
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                Your entire business.
                <br />
                <span className="bg-gradient-to-r from-primary via-violet-600 to-cyan-600 bg-clip-text text-transparent">
                  One powerful CRM.
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{APP_DESCRIPTION}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="rounded-full px-8 shadow-lg shadow-primary/20"
                  asChild
                >
                  <Link to="/register">
                    Start free trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
                  <Link to="/contact">Book a demo</Link>
                </Button>
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                {TRUST_POINTS.map((point) => (
                  <li key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-violet-500/10 to-cyan-500/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/90 shadow-2xl ring-1 ring-border/50 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{APP_NAME} Dashboard</span>
                  <IconBox icon={Gauge} tone="indigo" size="sm" className="rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6">
                  {HERO_METRICS.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-xl border border-border/50 bg-background/80 p-3 shadow-sm transition hover:border-primary/20 sm:p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                          {metric.label}
                        </p>
                        <IconBox icon={metric.icon} tone={metric.tone} size="sm" className="rounded-lg" />
                      </div>
                      <p className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Capabilities</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to turn leads into customers
              </h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Reveal key={feature.title}>
                <LandingIconCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  tone={feature.tone}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Platform</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                One platform. Every customer interaction.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                From first contact to closed deal — and everything after.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLATFORM.map((item) => (
              <Reveal key={item.title}>
                <LandingIconCard icon={item.icon} title={item.title} tone={item.tone} centered />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Industries</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Built for the way your business works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Real estate, agencies, education, healthcare, finance, and more.
              </p>
            </div>
          </Reveal>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {INDUSTRIES.map((industry) => (
              <Reveal key={industry.label}>
                <LandingPill icon={industry.icon} label={industry.label} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Flexibility</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Make the CRM fit your business
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Custom fields, pipelines, stages, roles, workflows, and reports.
              </p>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CUSTOMIZATION.map((item) => (
              <Reveal key={item.title}>
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm ring-1 ring-border/30 transition hover:border-primary/25 hover:shadow-md">
                  <IconBox icon={item.icon} tone="indigo" size="sm" className="rounded-xl" />
                  <span className="text-sm font-semibold">{item.title}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-gradient-to-br from-muted/40 via-background to-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 ring-1 ring-primary/20 shadow-lg">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Secure multi-tenant architecture
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Role-based access, permission management, workspace isolation, and audit logs —
                so each company&apos;s data stays separate and secure.
              </p>
              <div className="mt-8 grid w-full gap-4 sm:grid-cols-3">
                {[
                  { icon: ShieldCheck, label: "RBAC & permissions" },
                  { icon: Building2, label: "Tenant isolation" },
                  { icon: LineChart, label: "Audit trail" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm"
                  >
                    <IconBox icon={item.icon} tone="emerald" size="md" className="rounded-xl" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <PipelineSection />
      <CommunicationSection />
      <AnalyticsSection />
      <AutomationSection />

      <section className="relative overflow-hidden border-t border-border/60">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.12),transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <Reveal>
            <IconBox
              icon={Sparkles}
              tone="violet"
              size="lg"
              className="mx-auto mb-6 rounded-2xl shadow-md"
            />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to grow your business?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Set up your workspace and start managing leads, visits, bookings, and collections from one place.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20" asChild>
                <Link to="/register">
                  Start free trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
                <Link to="/contact">Book a demo</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
