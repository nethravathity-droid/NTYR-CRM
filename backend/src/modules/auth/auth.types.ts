export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED";
export type CompanyStatus = "TRIAL" | "ACTIVE" | "SUSPENDED" | "EXPIRED";
export type TokenType = "access" | "refresh";
export type LoginIdentifierType = "username" | "employee_code";

export interface AccessTokenPayload {
  sub: string;
  userId: number;
  companyId: number;
  companyUuid: string;
  companyCode: string;
  roleId: number;
  roleCode: string;
  permissions: string[];
  type: TokenType;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  userId: number;
  companyId: number;
  jti: string;
  type: TokenType;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: number;
  uuid: string;
  companyId: number;
  companyUuid: string;
  companyCode: string;
  roleId: number;
  roleCode: string;
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AccessTokenResult {
  accessToken: string;
  expiresIn: number;
}

export interface CompanyRecord {
  id: number;
  uuid: string;
  company_code: string;
  company_name: string;
  status: CompanyStatus;
}

export interface UserAuthRecord {
  id: number;
  uuid: string;
  company_id: number;
  branch_id: number;
  department_id: number;
  designation_id: number;
  role_id: number;
  employee_code: string;
  username: string;
  password_hash: string;
  first_name: string;
  last_name: string | null;
  display_name: string | null;
  official_email: string | null;
  mobile: string;
  profile_photo_url: string | null;
  failed_login_attempts: number;
  account_locked_until: Date | null;
  password_changed_at: Date | null;
  must_change_password: boolean;
  last_login_at: Date | null;
  email_verified: boolean;
  mobile_verified: boolean;
  status: UserStatus;
  deleted_at: Date | null;
  role_code: string;
  role_name: string;
  company_uuid: string;
  company_code: string;
  company_name: string;
  company_status: CompanyStatus;
  branch_uuid: string;
  branch_name: string;
  department_uuid: string;
  department_name: string;
  designation_name: string;
}

export interface RefreshTokenRecord {
  id: number;
  uuid: string;
  user_id: number;
  company_id: number;
  token_jti: string;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  replaced_by_token_jti: string | null;
}

export interface CurrentUserResponse {
  user: {
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
    mustChangePassword: boolean;
    lastLoginAt: Date | null;
    emailVerified: boolean;
    mobileVerified: boolean;
  };
  role: {
    id: number;
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
  company: {
    id: number;
    uuid: string;
    code: string;
    name: string;
    status: CompanyStatus;
  };
  permissions: string[];
}

export interface LoginResult {
  user: CurrentUserResponse;
  tokens: AuthTokens;
}

export interface RequestMetadata {
  ipAddress: string | undefined;
  userAgent: string | undefined;
}

export interface LoginLookup {
  identifierType: LoginIdentifierType;
  identifier: string;
}

export interface RegisterInput {
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
}

export interface ForgotPasswordInput {
  companyCode: string;
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface PasswordResetTokenRecord {
  id: number;
  user_id: number;
  company_id: number;
  token_hash: string;
  expires_at: Date;
  used_at: Date | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}
