import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useShell } from "@/context/ShellContext";
import { getCommandItemsForRole, type CommandItem } from "@/lib/rbac/command-items";
import { isRoleCode } from "@/lib/rbac/roles";
import { useState } from "react";

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useShell();
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
    if (!term) return items;
    return items.filter((item) =>
      `${item.label} ${item.group} ${item.keywords ?? ""}`.toLowerCase().includes(term),
    );
  }, [items, query]);

  const run = (item: CommandItem) => {
    setCommandOpen(false);
    setQuery("");
    navigate(item.href);
  };

  return (
    <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <Input
            autoFocus
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="max-h-80 overflow-y-auto border-t">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => run(item)}
              className="flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left transition hover:bg-muted/60"
            >
              <span className="font-medium">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.group}</span>
            </button>
          ))}
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">No matching commands.</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
