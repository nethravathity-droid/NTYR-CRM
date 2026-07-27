import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  EmployeeDetail,
  EmployeeFormOptions,
  EmployeeFormOptionsParams,
  ListEmployeesParams,
  PaginatedEmployees,
  UserStatus,
} from "@/features/employees/types/employee.types";
import type { EmployeeFormSchema } from "@/features/employees/schemas/employee.schema";
import { normalizeEmployeePayload } from "@/features/employees/schemas/employee.schema";

function normalizeEmployeeFormOptions(
  options: EmployeeFormOptions,
): EmployeeFormOptions {
  return {
    branches: options.branches.map((branch) => ({
      ...branch,
      id: Number(branch.id),
    })),
    departments: options.departments.map((department) => ({
      ...department,
      id: Number(department.id),
      branchId: Number(department.branchId),
    })),
    designations: options.designations.map((designation) => ({
      ...designation,
      id: Number(designation.id),
    })),
    roles: options.roles.map((role) => ({
      ...role,
      id: Number(role.id),
    })),
    managers: options.managers.map((manager) => ({
      ...manager,
      id: Number(manager.id),
    })),
  };
}

export const employeesService = {
  async list(params: ListEmployeesParams = {}): Promise<PaginatedEmployees> {
    const response = await apiClient.get<ApiResponse<PaginatedEmployees>>(
      "/users",
      { params },
    );
    return response.data.data;
  },

  async getFormOptions(
    params: EmployeeFormOptionsParams = {},
  ): Promise<EmployeeFormOptions> {
    const response = await apiClient.get<ApiResponse<EmployeeFormOptions>>(
      "/users/form-options",
      { params },
    );
    return normalizeEmployeeFormOptions(response.data.data);
  },

  async getByUuid(uuid: string): Promise<EmployeeDetail> {
    const response = await apiClient.get<ApiResponse<{ user: EmployeeDetail }>>(
      `/users/${uuid}`,
    );
    return response.data.data.user;
  },

  async create(values: EmployeeFormSchema): Promise<EmployeeDetail> {
    const response = await apiClient.post<ApiResponse<{ user: EmployeeDetail }>>(
      "/users",
      normalizeEmployeePayload(values),
    );
    return response.data.data.user;
  },

  async update(uuid: string, values: EmployeeFormSchema): Promise<EmployeeDetail> {
    const response = await apiClient.put<ApiResponse<{ user: EmployeeDetail }>>(
      `/users/${uuid}`,
      normalizeEmployeePayload(values),
    );
    return response.data.data.user;
  },

  async updateStatus(uuid: string, status: UserStatus): Promise<EmployeeDetail> {
    const response = await apiClient.patch<
      ApiResponse<{ user: EmployeeDetail }>
    >(`/users/${uuid}/status`, { status });
    return response.data.data.user;
  },

  async resetPassword(uuid: string, password: string): Promise<void> {
    await apiClient.post(`/users/${uuid}/reset-password`, { password });
  },

  async remove(uuid: string): Promise<void> {
    await apiClient.delete(`/users/${uuid}`);
  },
};
