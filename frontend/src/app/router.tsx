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
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
