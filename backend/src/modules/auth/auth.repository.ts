import type { Knex } from "knex";
import type {
  CompanyRecord,
  CurrentUserResponse,
  LoginLookup,
  PasswordResetTokenRecord,
  RefreshTokenRecord,
  UserAuthRecord,
} from "./auth.types.js";

const USER_AUTH_SELECT = [
  "u.id",
  "u.uuid",
  "u.company_id",
  "u.branch_id",
  "u.department_id",
  "u.designation_id",
  "u.role_id",
  "u.employee_code",
  "u.username",
  "u.password_hash",
  "u.first_name",
  "u.last_name",
  "u.display_name",
  "u.official_email",
  "u.mobile",
  "u.profile_photo_url",
  "u.failed_login_attempts",
  "u.account_locked_until",
  "u.password_changed_at",
  "u.must_change_password",
  "u.last_login_at",
  "u.email_verified",
  "u.mobile_verified",
  "u.status",
  "u.deleted_at",
  "r.role_code",
  "r.role_name",
  "c.uuid as company_uuid",
  "c.company_code",
  "c.company_name",
  "c.status as company_status",
  "b.uuid as branch_uuid",
  "b.branch_name",
  "d.uuid as department_uuid",
  "d.department_name",
  "des.designation_name",
] as const;

export class AuthRepository {
  constructor(private readonly db: Knex) {}

  async findCompanyByCode(companyCode: string): Promise<CompanyRecord | null> {
    const company = await this.db<CompanyRecord>("companies")
      .select("id", "uuid", "company_code", "company_name", "status")
      .whereRaw("LOWER(company_code) = LOWER(?)", [companyCode])
      .first();

    return company ?? null;
  }

  async findUserForLogin(
    companyId: number,
    lookup: LoginLookup,
  ): Promise<UserAuthRecord | null> {
    const query = this.db("users as u")
      .select(USER_AUTH_SELECT)
      .join("roles as r", "r.id", "u.role_id")
      .join("companies as c", "c.id", "u.company_id")
      .join("branches as b", "b.id", "u.branch_id")
      .join("departments as d", "d.id", "u.department_id")
      .join("designations as des", "des.id", "u.designation_id")
      .where("u.company_id", companyId)
      .whereNull("u.deleted_at")
      .whereNull("r.deleted_at");

    if (lookup.identifierType === "username") {
      query.whereRaw("LOWER(u.username) = LOWER(?)", [lookup.identifier]);
    } else {
      query.whereRaw("LOWER(u.employee_code) = LOWER(?)", [lookup.identifier]);
    }

    const user = await query.first<UserAuthRecord>();
    return user ?? null;
  }

  async findUserById(
    userId: number,
    companyId: number,
  ): Promise<UserAuthRecord | null> {
    const user = await this.db("users as u")
      .select(USER_AUTH_SELECT)
      .join("roles as r", "r.id", "u.role_id")
      .join("companies as c", "c.id", "u.company_id")
      .join("branches as b", "b.id", "u.branch_id")
      .join("departments as d", "d.id", "u.department_id")
      .join("designations as des", "des.id", "u.designation_id")
      .where("u.id", userId)
      .where("u.company_id", companyId)
      .whereNull("u.deleted_at")
      .whereNull("r.deleted_at")
      .first<UserAuthRecord>();

    return user ?? null;
  }

  async getPermissionsByRoleId(roleId: number): Promise<string[]> {
    const rows = await this.db("role_permissions as rp")
      .select("p.permission_code")
      .join("permissions as p", "p.id", "rp.permission_id")
      .where("rp.role_id", roleId)
      .where("p.status", "ACTIVE")
      .where(function permissionGranted() {
        this.where("rp.can_view", true)
          .orWhere("rp.can_create", true)
          .orWhere("rp.can_update", true)
          .orWhere("rp.can_delete", true)
          .orWhere("rp.can_export", true)
          .orWhere("rp.can_approve", true);
      });

    return rows.map((row: { permission_code: string }) => row.permission_code);
  }

  async recordSuccessfulLogin(
    userId: number,
    companyId: number,
    ipAddress: string | undefined,
    userAgent: string | undefined,
  ): Promise<void> {
    await this.db("users")
      .where({ id: userId, company_id: companyId })
      .update({
        failed_login_attempts: 0,
        account_locked_until: null,
        last_login_at: this.db.fn.now(),
        last_login_ip: ipAddress ?? null,
        last_login_device: userAgent ?? null,
        updated_at: this.db.fn.now(),
      });
  }

  async incrementFailedLoginAttempts(
    userId: number,
    companyId: number,
  ): Promise<number> {
    const user = await this.db("users")
      .select("failed_login_attempts")
      .where({ id: userId, company_id: companyId })
      .first<{ failed_login_attempts: number }>();

    const newAttempts = (user?.failed_login_attempts ?? 0) + 1;

    await this.db("users")
      .where({ id: userId, company_id: companyId })
      .update({
        failed_login_attempts: newAttempts,
        updated_at: this.db.fn.now(),
      });

    return newAttempts;
  }

  async lockUserAccount(
    userId: number,
    companyId: number,
    lockedUntil: Date,
  ): Promise<void> {
    await this.db("users")
      .where({ id: userId, company_id: companyId })
      .update({
        status: "LOCKED",
        account_locked_until: lockedUntil,
        updated_at: this.db.fn.now(),
      });
  }

  async createRefreshToken(data: {
    userId: number;
    companyId: number;
    tokenJti: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress: string | undefined;
    userAgent: string | undefined;
  }): Promise<void> {
    await this.db("refresh_tokens").insert({
      user_id: data.userId,
      company_id: data.companyId,
      token_jti: data.tokenJti,
      token_hash: data.tokenHash,
      expires_at: data.expiresAt,
      ip_address: data.ipAddress ?? null,
      user_agent: data.userAgent ?? null,
    });
  }

  async findRefreshTokenByJti(
    tokenJti: string,
  ): Promise<RefreshTokenRecord | null> {
    const token = await this.db<RefreshTokenRecord>("refresh_tokens")
      .where("token_jti", tokenJti)
      .whereNull("revoked_at")
      .where("expires_at", ">", this.db.fn.now())
      .first();

    return token ?? null;
  }

  async revokeRefreshToken(tokenJti: string): Promise<void> {
    await this.db("refresh_tokens")
      .where("token_jti", tokenJti)
      .whereNull("revoked_at")
      .update({ revoked_at: this.db.fn.now() });
  }

  async revokeAllUserRefreshTokens(
    userId: number,
    companyId: number,
  ): Promise<void> {
    await this.db("refresh_tokens")
      .where({ user_id: userId, company_id: companyId })
      .whereNull("revoked_at")
      .update({ revoked_at: this.db.fn.now() });
  }

  async updatePassword(
    userId: number,
    companyId: number,
    passwordHash: string,
  ): Promise<void> {
    await this.db("users")
      .where({ id: userId, company_id: companyId })
      .update({
        password_hash: passwordHash,
        password_changed_at: this.db.fn.now(),
        must_change_password: false,
        failed_login_attempts: 0,
        account_locked_until: null,
        updated_at: this.db.fn.now(),
      });
  }

  async findCurrentUserById(
    userId: number,
    companyId: number,
  ): Promise<CurrentUserResponse | null> {
    const user = await this.findUserById(userId, companyId);

    if (!user) {
      return null;
    }

    const permissions = await this.getPermissionsByRoleId(user.role_id);
    return this.mapToCurrentUserResponse(user, permissions);
  }

  async findUserPasswordHash(
    userId: number,
    companyId: number,
  ): Promise<string | null> {
    const user = await this.db("users")
      .select("password_hash")
      .where({ id: userId, company_id: companyId })
      .whereNull("deleted_at")
      .first<{ password_hash: string }>();

    return user?.password_hash ?? null;
  }

  mapToCurrentUserResponse(
    user: UserAuthRecord,
    permissions: string[],
  ): CurrentUserResponse {
    return {
      user: {
        id: user.id,
        uuid: user.uuid,
        employeeCode: user.employee_code,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        displayName: user.display_name,
        officialEmail: user.official_email,
        mobile: user.mobile,
        profilePhotoUrl: user.profile_photo_url,
        status: user.status,
        mustChangePassword: user.must_change_password ?? false,
        lastLoginAt: user.last_login_at,
        emailVerified: user.email_verified,
        mobileVerified: user.mobile_verified,
      },
      role: {
        id: user.role_id,
        code: user.role_code,
        name: user.role_name,
      },
      branch: {
        id: user.branch_id,
        uuid: user.branch_uuid,
        name: user.branch_name,
      },
      department: {
        id: user.department_id,
        uuid: user.department_uuid,
        name: user.department_name,
      },
      company: {
        id: user.company_id,
        uuid: user.company_uuid,
        code: user.company_code,
        name: user.company_name,
        status: user.company_status,
      },
      permissions,
    };
  }

  async createPasswordResetToken(data: {
    userId: number;
    companyId: number;
    tokenHash: string;
    expiresAt: Date;
    ipAddress: string | undefined;
    userAgent: string | undefined;
  }): Promise<void> {
    await this.db("password_reset_tokens").insert({
      user_id: data.userId,
      company_id: data.companyId,
      token_hash: data.tokenHash,
      expires_at: data.expiresAt,
      ip_address: data.ipAddress ?? null,
      user_agent: data.userAgent ?? null,
    });
  }

  async findValidPasswordResetToken(
    tokenHash: string,
  ): Promise<PasswordResetTokenRecord | null> {
    const token = await this.db<PasswordResetTokenRecord>("password_reset_tokens")
      .where("token_hash", tokenHash)
      .where("expires_at", ">", this.db.fn.now())
      .whereNull("used_at")
      .first();

    return token ?? null;
  }

  async markPasswordResetTokenUsed(tokenId: number): Promise<void> {
    await this.db("password_reset_tokens")
      .where({ id: tokenId })
      .update({ used_at: this.db.fn.now() });
  }

  async findUserByEmail(
    companyId: number,
    email: string,
  ): Promise<UserAuthRecord | null> {
    const user = await this.db("users as u")
      .select(USER_AUTH_SELECT)
      .join("roles as r", "r.id", "u.role_id")
      .join("companies as c", "c.id", "u.company_id")
      .join("branches as b", "b.id", "u.branch_id")
      .join("departments as d", "d.id", "u.department_id")
      .join("designations as des", "des.id", "u.designation_id")
      .where("u.company_id", companyId)
      .whereRaw("LOWER(u.official_email) = LOWER(?)", [email])
      .whereNull("u.deleted_at")
      .whereNull("r.deleted_at")
      .first<UserAuthRecord>();

    return user ?? null;
  }
}
