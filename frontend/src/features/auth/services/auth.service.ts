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
};
