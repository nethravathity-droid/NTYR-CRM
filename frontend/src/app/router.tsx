import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { CompaniesListPage } from "@/features/companies/pages/CompaniesListPage";
import { CompanyCreatePage } from "@/features/companies/pages/CompanyCreatePage";
import { CompanyDetailsPage } from "@/features/companies/pages/CompanyDetailsPage";
import { CompanyEditPage } from "@/features/companies/pages/CompanyEditPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PermissionRoute } from "@/routes/PermissionRoute";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
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
          <PermissionRoute permission="companies.view">
            <CompaniesListPage />
          </PermissionRoute>
        ),
      },
      {
        path: "companies/new",
        element: (
          <PermissionRoute permission="companies.create">
            <CompanyCreatePage />
          </PermissionRoute>
        ),
      },
      {
        path: "companies/:uuid",
        element: (
          <PermissionRoute permission="companies.view">
            <CompanyDetailsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "companies/:uuid/edit",
        element: (
          <PermissionRoute permission="companies.update">
            <CompanyEditPage />
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
