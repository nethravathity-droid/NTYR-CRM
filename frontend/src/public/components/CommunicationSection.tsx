import { Mail, MessageSquare, Phone } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const TABS = [
  {
    icon: Mail,
    label: "Email",
    title: "Email conversations",
    description: "Track every email thread directly inside the CRM.",
  },
  {
    icon: MessageSquare,
    label: "WhatsApp",
    title: "WhatsApp messages",
    description: "Send and receive WhatsApp messages from one inbox.",
  },
  {
    icon: Phone,
    label: "Calls",
    title: "Call history",
    description: "Log calls, recordings, and follow-ups automatically.",
  },
];

export function CommunicationSection() {
  const ref = useScrollReveal();

  return (
    <section className="border-t bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div ref={ref} className="text-center opacity-0 translate-y-6 transition-all duration-700">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Every conversation. One customer timeline.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Email, WhatsApp, SMS, and calling — unified in one place.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {TABS.map((tab) => (
            <div key={tab.label} className="rounded-2xl border bg-background p-6 shadow-sm">
              <tab.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{tab.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{tab.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
