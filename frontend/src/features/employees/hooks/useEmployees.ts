import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { employeesService } from "@/features/employees/services/employees.service";
import type {
  EmployeeFormOptionsParams,
  ListEmployeesParams,
  UserStatus,
} from "@/features/employees/types/employee.types";
import type { EmployeeFormSchema } from "@/features/employees/schemas/employee.schema";

export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (params: ListEmployeesParams) =>
    [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (uuid: string) => [...employeeKeys.details(), uuid] as const,
  formOptions: (params: EmployeeFormOptionsParams) =>
    [...employeeKeys.all, "form-options", params] as const,
};

export function useEmployees(
  params: ListEmployeesParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeesService.list(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useEmployee(uuid: string | undefined) {
  return useQuery({
    queryKey: employeeKeys.detail(uuid ?? ""),
    queryFn: () => employeesService.getByUuid(uuid!),
    enabled: Boolean(uuid),
  });
}

export function useEmployeeFormOptions(params: EmployeeFormOptionsParams = {}) {
  return useQuery({
    queryKey: employeeKeys.formOptions(params),
    queryFn: () => employeesService.getFormOptions(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: EmployeeFormSchema) => employeesService.create(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}

export function useUpdateEmployee(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: EmployeeFormSchema) =>
      employeesService.update(uuid, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}

export function useUpdateEmployeeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, status }: { uuid: string; status: UserStatus }) =>
      employeesService.updateStatus(uuid, status),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      void queryClient.invalidateQueries({
        queryKey: employeeKeys.detail(variables.uuid),
      });
    },
  });
}

export function useResetEmployeePassword() {
  return useMutation({
    mutationFn: ({ uuid, password }: { uuid: string; password: string }) =>
      employeesService.resetPassword(uuid, password),
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => employeesService.remove(uuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}
