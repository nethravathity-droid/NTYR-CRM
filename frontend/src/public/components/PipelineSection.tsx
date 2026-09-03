import { useScrollReveal } from "@/hooks/useScrollReveal";

const STAGES = [
  { name: "New Lead", count: 12, color: "bg-blue-500" },
  { name: "Contacted", count: 8, color: "bg-amber-500" },
  { name: "Qualified", count: 5, color: "bg-purple-500" },
  { name: "Proposal", count: 3, color: "bg-orange-500" },
  { name: "Negotiation", count: 2, color: "bg-emerald-500" },
  { name: "Won", count: 1, color: "bg-teal-500" },
];

export function PipelineSection() {
  const ref = useScrollReveal();

  return (
    <section className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div ref={ref} className="text-center opacity-0 translate-y-6 transition-all duration-700">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Know exactly where every opportunity stands.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Visualize your entire sales pipeline in one place.
          </p>
        </div>
        <div className="mt-12">
          <div className="rounded-2xl border bg-background p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {STAGES.map((stage) => (
                <div key={stage.name} className="rounded-xl border bg-muted/20 p-4">
                  <div className={`h-2 w-full rounded-full ${stage.color}`} />
                  <p className="mt-3 text-sm font-medium">{stage.name}</p>
                  <p className="text-2xl font-bold">{stage.count}</p>
                  <p className="text-xs text-muted-foreground">deals</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
