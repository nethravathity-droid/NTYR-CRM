import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { env } from "@/config/env";
import { usePermissions } from "@/hooks/usePermissions";
import type { NavItem } from "@/lib/rbac/navigation";

interface RoleSidebarProps {
  navigation: NavItem[];
  dashboardPath: string;
}

export function RoleSidebar({ navigation, dashboardPath }: RoleSidebarProps) {
  const { hasPermission } = usePermissions();

  const visibleNavigation = navigation.filter((item) => {
    if (item.disabled) {
      return false;
    }

    if (item.permission) {
      return hasPermission(item.permission);
    }

    return true;
  });

  const disabledNavigation = navigation.filter((item) => item.disabled);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-sidebar-foreground/70">
            CRM SaaS
          </p>
          <p className="font-semibold">{env.VITE_APP_NAME}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {visibleNavigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.href}
              end={item.href === dashboardPath}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {disabledNavigation.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/40"
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              <span className="ml-auto text-xs">Soon</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
