import { createBrowserRouter, Navigate, type RouteObject } from "react-router-dom";
import type { ReactElement } from "react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ForbiddenLayout } from "@/layouts/ForbiddenLayout";
import {
  AdminLayout,
  ManagerLayout,
  SalesLayout,
  SuperAdminLayout,
  TelecallerLayout,
} from "@/layouts/role-layouts";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ForbiddenPage } from "@/pages/ForbiddenPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleRootRedirect } from "@/routes/RoleRootRedirect";
import { RoleRoute } from "@/routes/RoleRoute";
import { paths } from "@/routes/paths";
import { ROLE_CODES, type RoleCode } from "@/lib/rbac/roles";
import {
  adminWorkspaceRoutes,
  managerWorkspaceRoutes,
  salesWorkspaceRoutes,
  superAdminWorkspaceRoutes,
  telecallerWorkspaceRoutes,
} from "@/routes/workspaceRoutes";

function createRoleWorkspace(
  path: string,
  allowedRoles: RoleCode[],
  layout: ReactElement,
  children: RouteObject[],
): RouteObject {
  return {
    path,
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={allowedRoles}>{layout}</RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      ...children,
    ],
  };
}

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
    path: "/",
    element: (
      <ProtectedRoute>
        <RoleRootRedirect />
      </ProtectedRoute>
    ),
  },
  createRoleWorkspace(
    "/super-admin",
    [ROLE_CODES.PLATFORM_SUPER_ADMIN],
    <SuperAdminLayout />,
    superAdminWorkspaceRoutes,
  ),
  createRoleWorkspace(
    "/admin",
    [ROLE_CODES.COMPANY_ADMIN],
    <AdminLayout />,
    adminWorkspaceRoutes,
  ),
  createRoleWorkspace(
    "/manager",
    [ROLE_CODES.MANAGER],
    <ManagerLayout />,
    managerWorkspaceRoutes,
  ),
  createRoleWorkspace(
    "/telecaller",
    [ROLE_CODES.TELECALLER],
    <TelecallerLayout />,
    telecallerWorkspaceRoutes,
  ),
  createRoleWorkspace(
    "/sales",
    [ROLE_CODES.SALES_EXECUTIVE],
    <SalesLayout />,
    salesWorkspaceRoutes,
  ),
  {
    path: paths.forbidden,
    element: (
      <ProtectedRoute>
        <ForbiddenLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ForbiddenPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
