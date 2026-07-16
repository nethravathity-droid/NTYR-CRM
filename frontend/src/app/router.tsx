import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
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
import { DashboardPage } from "@/pages/DashboardPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PermissionRoute } from "@/routes/PermissionRoute";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { SuperAdminRoute } from "@/routes/SuperAdminRoute";
import { paths } from "@/routes/paths";

export const router = createBrowserRouter([
  {
    path: paths.login,
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
  {
    path: paths.dashboard,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "companies",
        element: (
          <SuperAdminRoute>
            <PermissionRoute permission="companies.view">
              <CompaniesListPage />
            </PermissionRoute>
          </SuperAdminRoute>
        ),
      },
      {
        path: "companies/new",
        element: (
          <SuperAdminRoute>
            <PermissionRoute permission="companies.create">
              <CompanyCreatePage />
            </PermissionRoute>
          </SuperAdminRoute>
        ),
      },
      {
        path: "companies/:uuid",
        element: (
          <SuperAdminRoute>
            <PermissionRoute permission="companies.view">
              <CompanyDetailsPage />
            </PermissionRoute>
          </SuperAdminRoute>
        ),
      },
      {
        path: "companies/:uuid/edit",
        element: (
          <SuperAdminRoute>
            <PermissionRoute permission="companies.update">
              <CompanyEditPage />
            </PermissionRoute>
          </SuperAdminRoute>
        ),
      },
      {
        path: "employees",
        element: (
          <PermissionRoute permission="users.view">
            <EmployeesListPage />
          </PermissionRoute>
        ),
      },
      {
        path: "employees/new",
        element: (
          <PermissionRoute permission="users.create">
            <EmployeeCreatePage />
          </PermissionRoute>
        ),
      },
      {
        path: "employees/:uuid",
        element: (
          <PermissionRoute permission="users.view">
            <EmployeeDetailsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "employees/:uuid/edit",
        element: (
          <PermissionRoute permission="users.update">
            <EmployeeEditPage />
          </PermissionRoute>
        ),
      },
      {
        path: "leads",
        element: (
          <PermissionRoute permission="leads.view">
            <LeadsListPage />
          </PermissionRoute>
        ),
      },
      {
        path: "leads/new",
        element: (
          <PermissionRoute permission="leads.create">
            <LeadCreatePage />
          </PermissionRoute>
        ),
      },
      {
        path: "leads/import",
        element: (
          <PermissionRoute permission="leads.create">
            <LeadImportPage />
          </PermissionRoute>
        ),
      },
      {
        path: "leads/assign",
        element: (
          <PermissionRoute permission="leads.update">
            <LeadAssignPage />
          </PermissionRoute>
        ),
      },
      {
        path: "leads/:uuid",
        element: (
          <PermissionRoute permission="leads.view">
            <LeadDetailsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "leads/:uuid/edit",
        element: (
          <PermissionRoute permission="leads.update">
            <LeadEditPage />
          </PermissionRoute>
        ),
      },
      {
        path: "followups",
        element: (
          <PermissionRoute permission="leads.view">
            <FollowupsListPage />
          </PermissionRoute>
        ),
      },
      {
        path: "followups/new",
        element: (
          <PermissionRoute permission="leads.create">
            <FollowupCreatePage />
          </PermissionRoute>
        ),
      },
      {
        path: "followups/today",
        element: (
          <PermissionRoute permission="leads.view">
            <FollowupTodayPage />
          </PermissionRoute>
        ),
      },
      {
        path: "followups/calendar",
        element: (
          <PermissionRoute permission="leads.view">
            <FollowupCalendarPage />
          </PermissionRoute>
        ),
      },
      {
        path: "followups/:uuid/edit",
        element: (
          <PermissionRoute permission="leads.update">
            <FollowupEditPage />
          </PermissionRoute>
        ),
      },
      {
        path: "followups/:uuid/timeline",
        element: (
          <PermissionRoute permission="leads.view">
            <FollowupTimelinePage />
          </PermissionRoute>
        ),
      },
      {
        path: "projects",
        element: (
          <PermissionRoute permission="projects.view">
            <ProjectsListPage />
          </PermissionRoute>
        ),
      },
      {
        path: "projects/inventory",
        element: (
          <PermissionRoute permission="projects.view">
            <InventoryDashboardPage />
          </PermissionRoute>
        ),
      },
      {
        path: "projects/units",
        element: (
          <PermissionRoute permission="projects.view">
            <UnitsManagementPage />
          </PermissionRoute>
        ),
      },
      {
        path: "projects/new",
        element: (
          <PermissionRoute permission="projects.create">
            <ProjectCreatePage />
          </PermissionRoute>
        ),
      },
      {
        path: "projects/:uuid",
        element: (
          <PermissionRoute permission="projects.view">
            <ProjectDetailsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "projects/:uuid/edit",
        element: (
          <PermissionRoute permission="projects.update">
            <ProjectEditPage />
          </PermissionRoute>
        ),
      },
      {
        path: "projects/:uuid/towers",
        element: (
          <PermissionRoute permission="projects.update">
            <ProjectTowersPage />
          </PermissionRoute>
        ),
      },
      {
        path: "projects/:uuid/units",
        element: (
          <PermissionRoute permission="projects.view">
            <UnitsManagementPage />
          </PermissionRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
