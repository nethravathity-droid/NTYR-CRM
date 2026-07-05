export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED";

export interface UserListItem {
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
  lastLoginAt: Date | null;
  role: {
    id: number;
    code: string;
    name: string;
  };
  branch: {
    id: number;
    name: string;
  };
  department: {
    id: number;
    name: string;
  };
  designation: {
    id: number;
    name: string;
  };
  manager: {
    id: number;
    uuid: string;
    displayName: string | null;
  } | null;
  createdAt: Date;
}

export interface UserDetail {
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
  lastLoginAt: Date | null;
  passwordChangedAt: Date | null;
  role: {
    id: number;
    uuid: string;
    code: string;
    name: string;
  };
  branch: {
    id: number;
    uuid: string;
    name: string;
  };
  department: {
    id: number;
    uuid: string;
    name: string;
  };
  designation: {
    id: number;
    uuid: string;
    name: string;
  };
  manager: {
    id: number;
    uuid: string;
    employeeCode: string;
    displayName: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRecord {
  id: number;
  uuid: string;
  company_id: number;
  branch_id: number;
  department_id: number;
  designation_id: number;
  role_id: number;
  manager_user_id: number | null;
  employee_code: string;
  username: string;
  password_hash: string;
  first_name: string;
  last_name: string | null;
  display_name: string | null;
  official_email: string | null;
  mobile: string;
  profile_photo_url: string | null;
  status: UserStatus;
  email_verified: boolean;
  mobile_verified: boolean;
  last_login_at: Date | null;
  password_changed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CreateUserData {
  branchId: number;
  departmentId: number;
  designationId: number;
  roleId: number;
  managerUserId?: number | null;
  employeeCode: string;
  username: string;
  password: string;
  firstName: string;
  lastName?: string | null;
  displayName?: string | null;
  officialEmail?: string | null;
  mobile: string;
  profilePhotoUrl?: string | null;
}

export interface UpdateUserData {
  branchId?: number;
  departmentId?: number;
  designationId?: number;
  roleId?: number;
  managerUserId?: number | null;
  employeeCode?: string;
  username?: string;
  firstName?: string;
  lastName?: string | null;
  displayName?: string | null;
  officialEmail?: string | null;
  mobile?: string;
  profilePhotoUrl?: string | null;
}

export interface ListUsersQuery {
  page: number;
  limit: number;
  search?: string;
  branchId?: number;
  departmentId?: number;
  roleId?: number;
  status?: UserStatus;
  sortBy: "created_at" | "first_name" | "employee_code" | "last_login_at";
  sortOrder: "asc" | "desc";
}

export interface PaginatedUsersResult {
  users: UserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

export interface UserFormOptions {
  branches: LookupOption[];
  departments: DepartmentLookupOption[];
  designations: LookupOption[];
  roles: RoleLookupOption[];
  managers: ManagerLookupOption[];
}

export interface OrgEntityCheck {
  id: number;
  company_id: number;
  branch_id?: number;
}
