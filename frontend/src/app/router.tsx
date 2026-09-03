import { createBrowserRouter, Navigate, type RouteObject } from "react-router-dom";
import type { ReactElement } from "react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ForbiddenLayout } from "@/layouts/ForbiddenLayout";
import { PublicLayout } from "@/public/components/PublicLayout";
import {
  AdminLayout,
  ManagerLayout,
  SalesLayout,
  SuperAdminLayout,
  TelecallerLayout,
} from "@/layouts/role-layouts";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ForceChangePasswordPage } from "@/features/auth/pages/ForceChangePasswordPage";
import { ForbiddenPage } from "@/pages/ForbiddenPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { MustChangePasswordGate } from "@/routes/MustChangePasswordGate";
import { RoleRootRedirect } from "@/routes/RoleRootRedirect";
import { RoleRoute } from "@/routes/RoleRoute";
import { LegacyOrNotFound, RoleWorkspaceFallback } from "@/routes/LegacyOrNotFound";
import { paths } from "@/routes/paths";
import { ROLE_CODES, type RoleCode } from "@/lib/rbac/roles";
import {
  LandingPage,
} from "@/public/pages/LandingPage";
import { FeaturesPage } from "@/public/pages/FeaturesPage";
import { PricingPage } from "@/public/pages/PricingPage";
import { ContactPage } from "@/public/pages/ContactPage";
import { TermsPage } from "@/public/pages/TermsPage";
import { PrivacyPage } from "@/public/pages/PrivacyPage";
import { RegisterPage } from "@/public/pages/RegisterPage";
import { ForgotPasswordPage } from "@/public/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/public/pages/ResetPasswordPage";
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
        <MustChangePasswordGate>
          <RoleRoute allowedRoles={allowedRoles}>{layout}</RoleRoute>
        </MustChangePasswordGate>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      ...children,
      { path: "*", element: <RoleWorkspaceFallback /> },
    ],
  };
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "features", element: <FeaturesPage /> },
      { path: "pricing", element: <PricingPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "terms", element: <TermsPage /> },
      { path: "privacy", element: <PrivacyPage /> },
    ],
  },
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
    path: "/register",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: "/forgot-password",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <ForgotPasswordPage />,
      },
    ],
  },
  {
    path: "/reset-password",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <ResetPasswordPage />,
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
    path: "/force-change-password",
    element: (
      <ProtectedRoute>
        <ForceChangePasswordPage />
      </ProtectedRoute>
    ),
  },
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
    element: <LegacyOrNotFound />,
  },
]);
