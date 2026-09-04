import type { ReactElement } from "react";
import type { RouteObject } from "react-router-dom";
import { CompaniesListPage } from "@/features/companies/pages/CompaniesListPage";
import { CompanyCreatePage } from "@/features/companies/pages/CompanyCreatePage";
import { CompanyDetailsPage } from "@/features/companies/pages/CompanyDetailsPage";
import { CompanyEditPage } from "@/features/companies/pages/CompanyEditPage";
import { EmployeeCreatePage } from "@/features/employees/pages/EmployeeCreatePage";
import { EmployeeDetailsPage } from "@/features/employees/pages/EmployeeDetailsPage";
import { EmployeeEditPage } from "@/features/employees/pages/EmployeeEditPage";
import { EmployeesListPage } from "@/features/employees/pages/EmployeesListPage";
import { LeadAssignPage } from "@/features/leads/pages/LeadAssignPage";
import { LeadCreatePage } from "@/features/leads/pages/LeadCreatePage";
import { LeadsListPage } from "@/features/leads/pages/LeadsListPage";
import { LeadDetailsPage } from "@/features/leads/pages/LeadDetailsPage";
import { LeadEditPage } from "@/features/leads/pages/LeadEditPage";
import { LeadImportPage } from "@/features/leads/pages/LeadImportPage";
import { FollowupCalendarPage } from "@/features/followups/pages/FollowupCalendarPage";
import { FollowupCreatePage } from "@/features/followups/pages/FollowupCreatePage";
import { FollowupEditPage } from "@/features/followups/pages/FollowupEditPage";
import { FollowupTimelinePage } from "@/features/followups/pages/FollowupTimelinePage";
import { FollowupsListPage } from "@/features/followups/pages/FollowupsListPage";
import { FollowupTodayPage } from "@/features/followups/pages/FollowupTodayPage";
import { InventoryDashboardPage } from "@/features/properties/pages/InventoryDashboardPage";
import { ProjectCreatePage } from "@/features/properties/pages/ProjectCreatePage";
import { ProjectDetailsPage } from "@/features/properties/pages/ProjectDetailsPage";
import { ProjectEditPage } from "@/features/properties/pages/ProjectEditPage";
import { ProjectTowersPage } from "@/features/properties/pages/ProjectTowersPage";
import { ProjectsListPage } from "@/features/properties/pages/ProjectsListPage";
import { UnitsManagementPage } from "@/features/properties/pages/UnitsManagementPage";
import { VisitCalendarPage } from "@/features/visits/pages/VisitCalendarPage";
import { VisitCreatePage } from "@/features/visits/pages/VisitCreatePage";
import { VisitDetailsPage } from "@/features/visits/pages/VisitDetailsPage";
import { VisitEditPage } from "@/features/visits/pages/VisitEditPage";
import { VisitsListPage } from "@/features/visits/pages/VisitsListPage";
import { BookingApprovalPage } from "@/features/bookings/pages/BookingApprovalPage";
import { BookingCreatePage } from "@/features/bookings/pages/BookingCreatePage";
import { BookingDetailsPage } from "@/features/bookings/pages/BookingDetailsPage";
import { BookingDocumentsPage } from "@/features/bookings/pages/BookingDocumentsPage";
import { BookingEditPage } from "@/features/bookings/pages/BookingEditPage";
import { BookingsListPage } from "@/features/bookings/pages/BookingsListPage";
import { PaymentCreatePage } from "@/features/payments/pages/PaymentCreatePage";
import { PaymentDashboardPage } from "@/features/payments/pages/PaymentDashboardPage";
import { PaymentDetailsPage } from "@/features/payments/pages/PaymentDetailsPage";
import { PaymentEditPage } from "@/features/payments/pages/PaymentEditPage";
import { PaymentReceiptPage } from "@/features/payments/pages/PaymentReceiptPage";
import { PaymentSchedulePage } from "@/features/payments/pages/PaymentSchedulePage";
import { PaymentsListPage } from "@/features/payments/pages/PaymentsListPage";
import { BookingReportPage } from "@/features/reports/pages/BookingReportPage";
import { EmployeeReportPage } from "@/features/reports/pages/EmployeeReportPage";
import { FollowupReportPage } from "@/features/reports/pages/FollowupReportPage";
import { LeadReportPage } from "@/features/reports/pages/LeadReportPage";
import { PaymentReportPage } from "@/features/reports/pages/PaymentReportPage";
import { ReportsDashboardPage } from "@/features/reports/pages/ReportsDashboardPage";
import { SalesReportPage } from "@/features/reports/pages/SalesReportPage";
import { VisitReportPage } from "@/features/reports/pages/VisitReportPage";
import { CallCreatePage } from "@/features/calls/pages/CallCreatePage";
import { CallDetailsPage } from "@/features/calls/pages/CallDetailsPage";
import { CallEditPage } from "@/features/calls/pages/CallEditPage";
import { CallsDashboardPage } from "@/features/calls/pages/CallsDashboardPage";
import { CallsListPage } from "@/features/calls/pages/CallsListPage";
import {
  CompanyAdminDashboardPage,
  ManagerDashboardPage,
  SalesExecutiveDashboardPage,
  SuperAdminDashboardPage,
  TelecallerDashboardPage,
} from "@/features/dashboards";
import { ActivityLogPage } from "@/features/platform/pages/ActivityLogPage";
import { PlatformAnalyticsPage } from "@/features/platform/pages/PlatformAnalyticsPage";
import { SubscriptionsPage } from "@/features/platform/pages/SubscriptionsPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
import { MessagesPage } from "@/features/messages/pages/MessagesPage";
import { NotificationsPage } from "@/features/notifications/pages/NotificationsPage";
import { PermissionRoute } from "@/routes/PermissionRoute";
import { SuperAdminRoute } from "@/routes/SuperAdminRoute";
import { SuperAdminBroadcastPage } from "@/features/dashboards/pages/SuperAdminBroadcastPage";
import { WhatsAppInboxPage } from "@/features/whatsapp/pages/WhatsAppInboxPage";
import { WhatsAppSettingsPage } from "@/features/whatsapp/pages/WhatsAppSettingsPage";

export type WorkspaceRouteOptions = {
  dashboardElement?: ReactElement;
  includeSettings?: boolean;
  includePlatform?: boolean;
  includeCompanies?: boolean;
  includeEmployees?: boolean;
  includeLeads?: boolean;
  includeProjects?: boolean;
  includeVisits?: boolean;
  includeBookings?: boolean;
  includePayments?: boolean;
  includeCalls?: boolean;
  includeReports?: boolean;
};

function withPermission(permission: string, element: ReactElement) {
  return <PermissionRoute permission={permission}>{element}</PermissionRoute>;
}

function withSuperAdminPermission(permission: string, element: ReactElement) {
  return (
    <SuperAdminRoute>
      <PermissionRoute permission={permission}>{element}</PermissionRoute>
    </SuperAdminRoute>
  );
}

export function createWorkspaceRoutes(options: WorkspaceRouteOptions = {}): RouteObject[] {
  const {
    dashboardElement,
    includeSettings = true,
    includePlatform = false,
    includeCompanies = false,
    includeEmployees = false,
    includeLeads = true,
    includeProjects = false,
    includeVisits = true,
    includeBookings = true,
    includePayments = true,
    includeCalls = true,
    includeReports = false,
  } = options;

  const routes: RouteObject[] = [
    {
      path: "dashboard",
      element: dashboardElement ?? <SuperAdminDashboardPage />,
    },
  ];

  if (includeSettings) {
    routes.push(
      { path: "settings", element: <SettingsPage /> },
      { path: "messages", element: <MessagesPage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "whatsapp/inbox", element: <WhatsAppInboxPage /> },
      { path: "whatsapp/settings", element: <WhatsAppSettingsPage /> },
    );
  }

  if (includePlatform) {
    routes.push(
      { path: "subscriptions", element: withSuperAdminPermission("companies.view", <SubscriptionsPage />) },
      { path: "activity-log", element: withSuperAdminPermission("companies.view", <ActivityLogPage />) },
      { path: "analytics", element: withSuperAdminPermission("companies.view", <PlatformAnalyticsPage />) },
    );
  }

  if (includeCompanies) {
    routes.push(
      { path: "companies", element: withSuperAdminPermission("companies.view", <CompaniesListPage />) },
      { path: "companies/new", element: withSuperAdminPermission("companies.create", <CompanyCreatePage />) },
      { path: "companies/:uuid", element: withSuperAdminPermission("companies.view", <CompanyDetailsPage />) },
      { path: "companies/:uuid/edit", element: withSuperAdminPermission("companies.update", <CompanyEditPage />) },
    );
  }

  if (includeEmployees) {
    routes.push(
      { path: "employees", element: withPermission("users.view", <EmployeesListPage />) },
      { path: "employees/new", element: withPermission("users.create", <EmployeeCreatePage />) },
      { path: "employees/:uuid", element: withPermission("users.view", <EmployeeDetailsPage />) },
      { path: "employees/:uuid/edit", element: withPermission("users.update", <EmployeeEditPage />) },
    );
  }

  if (includeLeads) {
    routes.push(
      { path: "leads", element: withPermission("leads.view", <LeadsListPage />) },
      { path: "leads/new", element: withPermission("leads.create", <LeadCreatePage />) },
      { path: "leads/import", element: withPermission("leads.create", <LeadImportPage />) },
      { path: "leads/assign", element: withPermission("leads.update", <LeadAssignPage />) },
      { path: "leads/:uuid", element: withPermission("leads.view", <LeadDetailsPage />) },
      { path: "leads/:uuid/edit", element: withPermission("leads.update", <LeadEditPage />) },
      { path: "followups", element: withPermission("leads.view", <FollowupsListPage />) },
      { path: "followups/new", element: withPermission("leads.create", <FollowupCreatePage />) },
      { path: "followups/today", element: withPermission("leads.view", <FollowupTodayPage />) },
      { path: "followups/calendar", element: withPermission("leads.view", <FollowupCalendarPage />) },
      { path: "followups/:uuid/edit", element: withPermission("leads.update", <FollowupEditPage />) },
      { path: "followups/:uuid/timeline", element: withPermission("leads.view", <FollowupTimelinePage />) },
    );
  }

  if (includeProjects) {
    routes.push(
      { path: "projects", element: withPermission("projects.view", <ProjectsListPage />) },
      { path: "projects/inventory", element: withPermission("projects.view", <InventoryDashboardPage />) },
      { path: "projects/units", element: withPermission("projects.view", <UnitsManagementPage />) },
      { path: "projects/new", element: withPermission("projects.create", <ProjectCreatePage />) },
      { path: "projects/:uuid", element: withPermission("projects.view", <ProjectDetailsPage />) },
      { path: "projects/:uuid/edit", element: withPermission("projects.update", <ProjectEditPage />) },
      { path: "projects/:uuid/towers", element: withPermission("projects.update", <ProjectTowersPage />) },
      { path: "projects/:uuid/units", element: withPermission("projects.view", <UnitsManagementPage />) },
    );
  }

  if (includeVisits) {
    routes.push(
      { path: "visits", element: withPermission("visits.view", <VisitsListPage />) },
      { path: "visits/new", element: withPermission("visits.create", <VisitCreatePage />) },
      { path: "visits/calendar", element: withPermission("visits.view", <VisitCalendarPage />) },
      { path: "visits/:uuid", element: withPermission("visits.view", <VisitDetailsPage />) },
      { path: "visits/:uuid/edit", element: withPermission("visits.update", <VisitEditPage />) },
    );
  }

  if (includeBookings) {
    routes.push(
      { path: "bookings", element: withPermission("bookings.view", <BookingsListPage />) },
      { path: "bookings/new", element: withPermission("bookings.create", <BookingCreatePage />) },
      { path: "bookings/approvals", element: withPermission("bookings.update", <BookingApprovalPage />) },
      { path: "bookings/:uuid/documents", element: withPermission("bookings.update", <BookingDocumentsPage />) },
      { path: "bookings/:uuid/edit", element: withPermission("bookings.update", <BookingEditPage />) },
      { path: "bookings/:uuid", element: withPermission("bookings.view", <BookingDetailsPage />) },
    );
  }

  if (includePayments) {
    routes.push(
      { path: "payments", element: withPermission("payments.view", <PaymentDashboardPage />) },
      { path: "payments/list", element: withPermission("payments.view", <PaymentsListPage />) },
      { path: "payments/new", element: withPermission("payments.create", <PaymentCreatePage />) },
      { path: "payments/schedule", element: withPermission("payments.view", <PaymentSchedulePage />) },
      { path: "payments/:uuid/receipt", element: withPermission("payments.view", <PaymentReceiptPage />) },
      { path: "payments/:uuid/edit", element: withPermission("payments.update", <PaymentEditPage />) },
      { path: "payments/:uuid", element: withPermission("payments.view", <PaymentDetailsPage />) },
    );
  }

  if (includeCalls) {
    routes.push(
      { path: "calls", element: withPermission("calls.view", <CallsDashboardPage />) },
      { path: "calls/list", element: withPermission("calls.view", <CallsListPage />) },
      { path: "calls/new", element: withPermission("calls.create", <CallCreatePage />) },
      { path: "calls/:uuid/edit", element: withPermission("calls.update", <CallEditPage />) },
      { path: "calls/:uuid", element: withPermission("calls.view", <CallDetailsPage />) },
    );
  }

  if (includeReports) {
    routes.push(
      { path: "reports", element: withPermission("reports.view", <ReportsDashboardPage />) },
      { path: "reports/leads", element: withPermission("reports.view", <LeadReportPage />) },
      { path: "reports/sales", element: withPermission("reports.view", <SalesReportPage />) },
      { path: "reports/employees", element: withPermission("reports.view", <EmployeeReportPage />) },
      { path: "reports/followups", element: withPermission("reports.view", <FollowupReportPage />) },
      { path: "reports/visits", element: withPermission("reports.view", <VisitReportPage />) },
      { path: "reports/bookings", element: withPermission("reports.view", <BookingReportPage />) },
      { path: "reports/payments", element: withPermission("reports.view", <PaymentReportPage />) },
    );
  }

  return routes;
}

export const superAdminWorkspaceRoutes = createWorkspaceRoutes({
  dashboardElement: <SuperAdminDashboardPage />,
  includePlatform: true,
  includeCompanies: true,
  includeLeads: false,
  includeVisits: false,
  includeBookings: false,
  includePayments: false,
  includeCalls: false,
});

superAdminWorkspaceRoutes.push(
  { path: "support/broadcast", element: withSuperAdminPermission("companies.view", <SuperAdminBroadcastPage />) },
);

export const adminWorkspaceRoutes = createWorkspaceRoutes({
  dashboardElement: <CompanyAdminDashboardPage />,
  includeEmployees: true,
  includeProjects: true,
  includeReports: true,
});

export const managerWorkspaceRoutes = createWorkspaceRoutes({
  dashboardElement: <ManagerDashboardPage />,
  includeProjects: true,
  includeReports: true,
});

export const telecallerWorkspaceRoutes = createWorkspaceRoutes({
  dashboardElement: <TelecallerDashboardPage />,
  includeVisits: false,
  includeBookings: false,
  includePayments: false,
});

export const salesWorkspaceRoutes = createWorkspaceRoutes({
  dashboardElement: <SalesExecutiveDashboardPage />,
  includeVisits: true,
  includeBookings: true,
  includePayments: true,
  includeProjects: true,
});
