import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useShell } from "@/context/ShellContext";
import { getCommandItemsForRole } from "@/lib/rbac/command-items";
import { isRoleCode } from "@/lib/rbac/roles";

export function MegaSearch() {
  const { searchOpen, setSearchOpen } = useShell();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const roleCode = isRoleCode(user?.role.code) ? user.role.code : null;
    if (!roleCode) return [];
    return getCommandItemsForRole(roleCode).filter((item) => !item.permission || hasPermission(item.permission));
  }, [hasPermission, user?.role.code]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items.slice(0, 12);
    return items.filter((item) =>
      `${item.label} ${item.group} ${item.keywords ?? ""}`.toLowerCase().includes(term),
    );
  }, [items, query]);

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle>Search workspace</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <Input
            autoFocus
            placeholder="Search modules, pages, and actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="grid max-h-[420px] gap-1 overflow-y-auto border-t p-2 sm:grid-cols-2">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setQuery("");
                navigate(item.href);
              }}
              className="rounded-xl border bg-background/70 px-4 py-3 text-left transition hover:bg-muted/60"
            >
              <p className="font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.group}</p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
