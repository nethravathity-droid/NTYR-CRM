export type GlobalSearchCategory =
  | "all"
  | "pages"
  | "leads"
  | "customers"
  | "employees"
  | "bookings"
  | "visits"
  | "projects"
  | "payments"
  | "companies";

export type GlobalSearchResultType =
  | "page"
  | "lead"
  | "employee"
  | "booking"
  | "visit"
  | "project"
  | "payment"
  | "company";

export interface GlobalSearchResult {
  id: string;
  type: GlobalSearchResultType;
  label: string;
  subtitle: string;
  href: string;
  group: string;
}

export interface GlobalSearchPermissions {
  leads: boolean;
  employees: boolean;
  bookings: boolean;
  visits: boolean;
  projects: boolean;
  payments: boolean;
  companies: boolean;
}
