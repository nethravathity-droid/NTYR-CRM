export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED";
export type CompanyStatus = "TRIAL" | "ACTIVE" | "SUSPENDED" | "EXPIRED";

export interface AuthUser {
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
  lastLoginAt: string | null;
  emailVerified: boolean;
  mobileVerified: boolean;
}

export interface AuthRole {
  id: number;
  code: string;
  name: string;
}

export interface AuthBranch {
  id: number;
  uuid: string;
  name: string;
}

export interface AuthDepartment {
  id: number;
  uuid: string;
  name: string;
}

export interface AuthCompany {
  id: number;
  uuid: string;
  code: string;
  name: string;
  status: CompanyStatus;
}

export interface CurrentUser {
  user: AuthUser;
  role: AuthRole;
  branch: AuthBranch;
  department: AuthDepartment;
  company: AuthCompany;
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginPayload {
  companyCode: string;
  password: string;
  username?: string;
  employeeCode?: string;
}

export interface LoginResponse {
  user: CurrentUser;
  tokens: AuthTokens;
}
