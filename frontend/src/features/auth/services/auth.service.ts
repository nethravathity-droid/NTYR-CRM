import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  CurrentUser,
  LoginPayload,
  LoginResponse,
} from "@/features/auth/types/auth.types";

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      payload,
    );
    return response.data.data;
  },

  async register(payload: {
    companyCode: string;
    companyName: string;
    ownerName: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    country?: string;
    postalCode: string;
    addressLine1: string;
    addressLine2?: string;
    legalName?: string;
    gstNumber?: string;
    panNumber?: string;
    reraNumber?: string;
    website?: string;
    timezone?: string;
    currency?: string;
    trialStartDate?: string;
    trialEndDate?: string;
    notes?: string;
    username: string;
    password: string;
    employeeCode?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
  }): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/auth/register",
      payload,
    );
    return response.data.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post("/auth/logout", { refreshToken });
  },

  async getCurrentUser(): Promise<CurrentUser> {
    const response = await apiClient.get<ApiResponse<CurrentUser>>("/auth/me");
    return response.data.data;
  },

  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    await apiClient.post("/auth/change-password", payload);
  },

  async forgotPassword(payload: { companyCode: string; email: string }): Promise<void> {
    await apiClient.post("/auth/forgot-password", payload);
  },

  async resetPassword(payload: { token: string; password: string }): Promise<void> {
    await apiClient.post("/auth/reset-password", payload);
  },

  async broadcastSupportMessage(payload: {
    body: string;
    statuses: string[];
  }): Promise<{ count: number }> {
    const response = await apiClient.post<ApiResponse<{ count: number }>>(
      "/support/broadcast",
      payload,
    );
    return response.data.data;
  },
};
