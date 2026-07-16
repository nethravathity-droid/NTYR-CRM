import { AppShell } from "@/layouts/AppShell";
import { ROLE_CODES } from "@/lib/rbac/roles";

export function SuperAdminLayout() {
  return <AppShell roleCode={ROLE_CODES.PLATFORM_SUPER_ADMIN} />;
}

export function AdminLayout() {
  return <AppShell roleCode={ROLE_CODES.COMPANY_ADMIN} />;
}

export function ManagerLayout() {
  return <AppShell roleCode={ROLE_CODES.MANAGER} />;
}

export function TelecallerLayout() {
  return <AppShell roleCode={ROLE_CODES.TELECALLER} />;
}

export function SalesLayout() {
  return <AppShell roleCode={ROLE_CODES.SALES_EXECUTIVE} />;
}
