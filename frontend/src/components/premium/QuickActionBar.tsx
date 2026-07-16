import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/premium/PremiumCards";

export type QuickAction = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export function QuickActionBar({ actions }: { actions: QuickAction[] }) {
  if (actions.length === 0) return null;

  return (
    <GlassCard className="p-4">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button key={action.label} variant="secondary" className="rounded-xl" asChild>
              <Link to={action.href}>
                <Icon className="mr-2 h-4 w-4" />
                {action.label}
              </Link>
            </Button>
          );
        })}
      </div>
    </GlassCard>
  );
}
