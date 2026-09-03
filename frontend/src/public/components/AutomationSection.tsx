import { CheckCircle2, ChevronRight, GitBranch } from "lucide-react";
import { Card } from "@/components/ui/card";

const STEPS = [
  {
    title: "New Lead",
    description: "Lead enters the system from any source",
  },
  {
    title: "Assign Sales Rep",
    description: "Automatically assign based on rules or round-robin",
  },
  {
    title: "Send Welcome Message",
    description: "Instant email, WhatsApp, or SMS",
  },
  {
    title: "Wait 1 Day",
    description: "Smart delay between actions",
  },
  {
    title: "Follow Up",
    description: "Create task and notify assigned rep",
  },
  {
    title: "Branch",
    description: "If responded → Create Deal. If not → Schedule follow-up",
  },
];

export function AutomationSection() {
  return (
    <section className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Build workflows without complexity.
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Automate repetitive tasks and keep your team focused on what matters.
          </p>
        </div>
        <div className="mt-12">
          <div className="rounded-2xl border bg-background p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <GitBranch className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">New Lead Follow-Up Workflow</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {STEPS.map((step, index) => (
                <div key={step.title} className="relative">
                  <Card className="h-full p-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {index === STEPS.length - 1 ? (
                          <GitBranch className="h-5 w-5 text-primary" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{step.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                  {index < STEPS.length - 1 && (
                    <div className="hidden lg:flex absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-10">
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
