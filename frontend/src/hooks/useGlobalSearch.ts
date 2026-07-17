import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { getCommandItemsForRole, type CommandItem } from "@/lib/rbac/command-items";
import { isRoleCode } from "@/lib/rbac/roles";
import { filterNavigationItems, searchRecords } from "@/lib/search/global-search.service";
import type { GlobalSearchCategory, GlobalSearchResult } from "@/lib/search/global-search.types";

export const globalSearchKeys = {
  all: ["global-search"] as const,
  records: (query: string, category: GlobalSearchCategory) =>
    [...globalSearchKeys.all, "records", category, query] as const,
};

export function useGlobalSearch(query: string, category: GlobalSearchCategory, navItems: CommandItem[]) {
  const { hasPermission } = usePermissions();

  const permissions = useMemo(
    () => ({
      leads: hasPermission("leads.view"),
      employees: hasPermission("users.view"),
      bookings: hasPermission("bookings.view"),
      visits: hasPermission("visits.view"),
      projects: hasPermission("projects.view"),
      payments: hasPermission("payments.view"),
      companies: hasPermission("companies.view"),
    }),
    [hasPermission],
  );

  const trimmed = query.trim();
  const [debouncedQuery, setDebouncedQuery] = useState(trimmed);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(trimmed), 300);
    return () => window.clearTimeout(timer);
  }, [trimmed]);

  const pageResults = useMemo(
    () => (category === "all" || category === "pages" ? filterNavigationItems(navItems, trimmed) : []),
    [category, navItems, trimmed],
  );

  const { data: recordResults = [], isFetching: recordsLoading } = useQuery({
    queryKey: globalSearchKeys.records(debouncedQuery, category),
    queryFn: () => searchRecords(debouncedQuery, permissions, category),
    enabled: debouncedQuery.length >= 2 && category !== "pages",
    staleTime: 30_000,
  });

  const results = useMemo(() => {
    const typeMap: Record<GlobalSearchCategory, GlobalSearchResult["type"][] | null> = {
      all: null,
      pages: ["page"],
      leads: ["lead"],
      customers: ["lead"],
      employees: ["employee"],
      bookings: ["booking"],
      visits: ["visit"],
      projects: ["project"],
      payments: ["payment"],
      companies: ["company"],
    };

    const allowedTypes = typeMap[category];
    const pages = category === "all" || category === "pages" ? pageResults : [];
    const records =
      debouncedQuery.length >= 2 && category !== "pages"
        ? allowedTypes === null
          ? recordResults
          : recordResults.filter((result) => allowedTypes.includes(result.type))
        : [];

    return [...pages, ...records];
  }, [category, debouncedQuery, pageResults, recordResults]);

  return {
    results,
    isSearching: (recordsLoading || debouncedQuery !== trimmed) && trimmed.length >= 2,
    hasQuery: trimmed.length > 0,
  };
}

export function useSearchNavItems(roleCode: string | undefined) {
  const { hasPermission } = usePermissions();

  return useMemo(() => {
    if (!roleCode || !isRoleCode(roleCode)) return [];
    return getCommandItemsForRole(roleCode).filter(
      (item) => !item.permission || hasPermission(item.permission),
    );
  }, [hasPermission, roleCode]);
}
