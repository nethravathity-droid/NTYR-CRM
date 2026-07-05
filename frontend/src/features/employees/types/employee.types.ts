export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED";

export interface EmployeeListItem {
  id: number;
  uuid: string;
  employeeCode: string;
  username: string;
  firstName: string;
  lastName: string | null;
  displayName: string | null;
  officialEmail: string | null;
  mobile: string;
  status: UserStatus;
  lastLoginAt: string | null;
  role: { id: number; code: string; name: string };
  branch: { id: number; name: string };
  department: { id: number; name: string };
  designation: { id: number; name: string };
  manager: { id: number; uuid: string; displayName: string | null } | null;
  createdAt: string;
}

export interface EmployeeDetail {
  id: number;
  uuid: string;
  employeeCode: string;
  username: string;
  firstName: string;
  lastName: string | null;
  displayName: string | null;
  officialEmail: string | null;
  mobile: string;
  profilePhotoUrl: string | null;
  status: UserStatus;
  emailVerified: boolean;
  mobileVerified: boolean;
  lastLoginAt: string | null;
  passwordChangedAt: string | null;
  role: { id: number; uuid: string; code: string; name: string };
  branch: { id: number; uuid: string; name: string };
  department: { id: number; uuid: string; name: string };
  designation: { id: number; uuid: string; name: string };
  manager: {
    id: number;
    uuid: string;
    employeeCode: string;
    displayName: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedEmployees {
  users: EmployeeListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: number;
  departmentId?: number;
  roleId?: number;
  status?: UserStatus;
  sortBy?: "created_at" | "first_name" | "employee_code" | "last_login_at";
  sortOrder?: "asc" | "desc";
}

export interface LookupOption {
  id: number;
  uuid: string;
  name: string;
}

export interface DepartmentLookupOption extends LookupOption {
  branchId: number;
}

export interface RoleLookupOption extends LookupOption {
  code: string;
}

export interface ManagerLookupOption {
  id: number;
  uuid: string;
  employeeCode: string;
  displayName: string | null;
  firstName: string;
  lastName: string | null;
}

export interface EmployeeFormOptions {
  branches: LookupOption[];
  departments: DepartmentLookupOption[];
  designations: LookupOption[];
  roles: RoleLookupOption[];
  managers: ManagerLookupOption[];
}

export interface EmployeeFormOptionsParams {
  branchId?: number;
  excludeUserId?: number;
}

export type EmployeeFormValues = {
  branchId: number;
  departmentId: number;
  designationId: number;
  roleId: number;
  managerUserId?: number | null;
  employeeCode: string;
  username: string;
  password?: string;
  firstName: string;
  lastName?: string;
  displayName?: string;
  officialEmail?: string;
  mobile: string;
  profilePhotoUrl?: string;
};
