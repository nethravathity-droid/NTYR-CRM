import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { env } from "@/config/env";
import { usePermissions } from "@/hooks/usePermissions";
import { useShell } from "@/context/ShellContext";
import type { NavSection } from "@/lib/rbac/navigation";

interface PremiumSidebarProps {
  sections: NavSection[];
  dashboardPath: string;
  workspaceLabel: string;
}

export function PremiumSidebar({ sections, dashboardPath, workspaceLabel }: PremiumSidebarProps) {
  const { hasPermission } = usePermissions();
  const { sidebarCollapsed, toggleSidebar } = useShell();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleSections = useMemo(
    () =>
      sections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => {
            if (item.disabled) return false;
            if (!item.permission) return true;
            return hasPermission(item.permission);
          }),
        }))
        .filter((section) => section.items.length > 0),
    [sections, hasPermission],
  );

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border/60 px-4">
        {!sidebarCollapsed ? (
          <div className="min-w-0">
            <p className="truncate text-xs uppercase tracking-[0.2em] text-sidebar-foreground/60">Enterprise CRM</p>
            <p className="truncate font-semibold">{env.VITE_APP_NAME}</p>
          </div>
        ) : (
          <Sparkles className="mx-auto h-5 w-5 text-primary" />
        )}
        <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={toggleSidebar}>
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {!sidebarCollapsed ? (
        <div className="border-b border-sidebar-border/60 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">Workspace</p>
          <p className="truncate text-sm font-medium">{workspaceLabel}</p>
        </div>
      ) : null}

      <nav className="flex-1 space-y-5 overflow-y-auto p-3">
        {visibleSections.map((section) => (
          <div key={section.title}>
            {!sidebarCollapsed ? (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
                {section.title}
              </p>
            ) : null}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    end={item.href === dashboardPath}
                    title={sidebarCollapsed ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                        sidebarCollapsed && "justify-center px-2",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-primary/10"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground",
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed ? <span className="truncate">{item.label}</span> : null}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden" hidden={!mobileOpen} onClick={() => setMobileOpen(false)} />

      <aside
        className={cn(
          "premium-sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-300 lg:translate-x-0",
          sidebarCollapsed ? "w-[84px]" : "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {sidebarContent}
      </aside>

      <Button
        variant="outline"
        size="sm"
        className="fixed left-4 top-4 z-30 lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        Menu
      </Button>
    </>
  );
}
