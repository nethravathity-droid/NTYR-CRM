import type { NavItem } from "@/lib/rbac/navigation";

export function isNavItemActive(
  item: NavItem,
  pathname: string,
  search: string,
  dashboardPath: string,
): boolean {
  const url = new URL(item.href, "http://localhost");
  const pathMatches = pathname === url.pathname;

  if (!pathMatches) {
    return false;
  }

  if (url.search) {
    const expected = new URLSearchParams(url.search);
    const current = new URLSearchParams(search);
    for (const [key, value] of expected.entries()) {
      if (current.get(key) !== value) {
        return false;
      }
    }
    return true;
  }

  if (item.excludeQueryParam) {
    const current = new URLSearchParams(search);
    if (current.has(item.excludeQueryParam)) {
      return false;
    }
  }

  if (item.href === dashboardPath) {
    return pathname === url.pathname;
  }

  return true;
}
