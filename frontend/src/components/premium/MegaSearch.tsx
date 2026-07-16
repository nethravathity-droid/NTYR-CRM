import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  CalendarCheck,
  CreditCard,
  FolderKanban,
  LayoutGrid,
  Loader2,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useGlobalSearch, useSearchNavItems } from "@/hooks/useGlobalSearch";
import { useShell } from "@/context/ShellContext";
import { highlightMatch } from "@/lib/search/match-query";
import type { GlobalSearchCategory, GlobalSearchResult } from "@/lib/search/global-search.types";

const CATEGORY_OPTIONS: Array<{ id: GlobalSearchCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "pages", label: "Pages" },
  { id: "leads", label: "Leads" },
  { id: "customers", label: "Customers" },
  { id: "employees", label: "Employees" },
  { id: "bookings", label: "Bookings" },
  { id: "visits", label: "Visits" },
  { id: "projects", label: "Properties" },
  { id: "payments", label: "Payments" },
  { id: "companies", label: "Companies" },
];

function ResultIcon({ type }: { type: GlobalSearchResult["type"] }) {
  const className = "h-4 w-4 shrink-0 text-[#2563EB]";
  switch (type) {
    case "lead":
      return <Users className={className} />;
    case "employee":
      return <UserRound className={className} />;
    case "booking":
      return <CalendarCheck className={className} />;
    case "visit":
      return <CalendarCheck className={className} />;
    case "project":
      return <FolderKanban className={className} />;
    case "payment":
      return <CreditCard className={className} />;
    case "company":
      return <Building2 className={className} />;
    default:
      return <LayoutGrid className={className} />;
  }
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const highlighted = highlightMatch(text, query);
  if (!highlighted) return <>{text}</>;
  return (
    <>
      {highlighted.before}
      <mark className="rounded bg-[#2563EB]/15 px-0.5 text-foreground">{highlighted.match}</mark>
      {highlighted.after}
    </>
  );
}

export function MegaSearch() {
  const { searchOpen, setSearchOpen, searchQuery, setSearchQuery } = useShell();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const [category, setCategory] = useState<GlobalSearchCategory>("all");

  const navItems = useSearchNavItems(user?.role.code);
  const { results, isSearching, hasQuery } = useGlobalSearch(searchQuery, category, navItems);

  const visibleCategories = useMemo(
    () =>
      CATEGORY_OPTIONS.filter((option) => {
        if (option.id === "all" || option.id === "pages") return true;
        if (option.id === "leads" || option.id === "customers") return hasPermission("leads.view");
        if (option.id === "employees") return hasPermission("users.view");
        if (option.id === "bookings") return hasPermission("bookings.view");
        if (option.id === "visits") return hasPermission("visits.view");
        if (option.id === "projects") return hasPermission("projects.view");
        if (option.id === "payments") return hasPermission("payments.view");
        if (option.id === "companies") return hasPermission("companies.view");
        return false;
      }),
    [hasPermission],
  );

  const groupedResults = useMemo(() => {
    const groups = new Map<string, GlobalSearchResult[]>();
    for (const result of results) {
      const existing = groups.get(result.group) ?? [];
      existing.push(result);
      groups.set(result.group, existing);
    }
    return Array.from(groups.entries());
  }, [results]);

  const handleClose = (open: boolean) => {
    setSearchOpen(open);
    if (!open) {
      setSearchQuery("");
      setCategory("all");
    }
  };

  const handleSelect = (result: GlobalSearchResult) => {
    setSearchOpen(false);
    setSearchQuery("");
    setCategory("all");
    navigate(result.href);
  };

  return (
    <Dialog open={searchOpen} onOpenChange={handleClose}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle>Search workspace</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              className="pl-9"
              placeholder="Type to search leads, bookings, employees, pages..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {visibleCategories.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setCategory(option.id)}
                className="rounded-full"
              >
                <Badge
                  variant={category === option.id ? "default" : "outline"}
                  className={
                    category === option.id
                      ? "rounded-full bg-[#2563EB] hover:bg-[#2563EB]/90"
                      : "rounded-full"
                  }
                >
                  {option.label}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto border-t">
          {isSearching ? (
            <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          ) : results.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              {hasQuery
                ? "No matching results. Try a different keyword or category."
                : "Start typing to search pages and records."}
            </p>
          ) : (
            groupedResults.map(([group, items]) => (
              <div key={group} className="border-b last:border-b-0">
                <p className="sticky top-0 bg-background/95 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
                  {group}
                </p>
                {items.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => handleSelect(result)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-muted/60"
                  >
                    <ResultIcon type={result.type} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        <HighlightedText text={result.label} query={searchQuery} />
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        <HighlightedText text={result.subtitle} query={searchQuery} />
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
