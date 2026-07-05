import type { Knex } from "knex";
import type {
  CreateUserData,
  ListUsersQuery,
  OrgEntityCheck,
  PaginatedUsersResult,
  UpdateUserData,
  UserDetail,
  UserListItem,
  UserRecord,
  UserStatus,
} from "./users.types.js";

const USER_LIST_SELECT = [
  "u.id",
  "u.uuid",
  "u.employee_code",
  "u.username",
  "u.first_name",
  "u.last_name",
  "u.display_name",
  "u.official_email",
  "u.mobile",
  "u.status",
  "u.last_login_at",
  "u.created_at",
  "u.role_id",
  "r.role_code",
  "r.role_name",
  "u.branch_id",
  "b.branch_name",
  "u.department_id",
  "d.department_name",
  "u.designation_id",
  "des.designation_name",
  "u.manager_user_id",
  "mgr.uuid as manager_uuid",
  "mgr.display_name as manager_display_name",
] as const;

export class UsersRepository {
  constructor(private readonly db: Knex) {}

  async listUsers(
    companyId: number,
    query: ListUsersQuery,
  ): Promise<PaginatedUsersResult> {
    const baseQuery = this.db("users as u")
      .join("roles as r", "r.id", "u.role_id")
      .join("branches as b", "b.id", "u.branch_id")
      .join("departments as d", "d.id", "u.department_id")
      .join("designations as des", "des.id", "u.designation_id")
      .leftJoin("users as mgr", "mgr.id", "u.manager_user_id")
      .where("u.company_id", companyId)
      .whereNull("u.deleted_at")
      .whereNull("r.deleted_at");

    if (query.search) {
      const term = `%${query.search}%`;
      baseQuery.where(function searchFilter() {
        this.whereILike("u.first_name", term)
          .orWhereILike("u.last_name", term)
          .orWhereILike("u.display_name", term)
          .orWhereILike("u.employee_code", term)
          .orWhereILike("u.username", term)
          .orWhereILike("u.mobile", term)
          .orWhereILike("u.official_email", term);
      });
    }

    if (query.branchId) {
      baseQuery.where("u.branch_id", query.branchId);
    }

    if (query.departmentId) {
      baseQuery.where("u.department_id", query.departmentId);
    }

    if (query.roleId) {
      baseQuery.where("u.role_id", query.roleId);
    }

    if (query.status) {
      baseQuery.where("u.status", query.status);
    }

    const countResult = await baseQuery
      .clone()
      .countDistinct("u.id as total")
      .first<{ total: string }>();

    const total = Number(countResult?.total ?? 0);
    const offset = (query.page - 1) * query.limit;

    const rows = await baseQuery
      .clone()
      .select(USER_LIST_SELECT)
      .orderBy(`u.${query.sortBy}`, query.sortOrder)
      .limit(query.limit)
      .offset(offset);

    return {
      users: rows.map((row) => this.mapToListItem(row)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 0,
      },
    };
  }

  async findUserByUuid(
    companyId: number,
    uuid: string,
  ): Promise<UserDetail | null> {
    const user = await this.db("users as u")
      .select(
        "u.id",
        "u.uuid",
        "u.employee_code",
        "u.username",
        "u.first_name",
        "u.last_name",
        "u.display_name",
        "u.official_email",
        "u.mobile",
        "u.profile_photo_url",
        "u.status",
        "u.email_verified",
        "u.mobile_verified",
        "u.last_login_at",
        "u.password_changed_at",
        "u.created_at",
        "u.updated_at",
        "u.manager_user_id",
        "r.id as role_id",
        "r.uuid as role_uuid",
        "r.role_code",
        "r.role_name",
        "b.id as branch_id",
        "b.uuid as branch_uuid",
        "b.branch_name",
        "d.id as department_id",
        "d.uuid as department_uuid",
        "d.department_name",
        "des.id as designation_id",
        "des.uuid as designation_uuid",
        "des.designation_name",
        "mgr.id as manager_id",
        "mgr.uuid as manager_uuid",
        "mgr.employee_code as manager_employee_code",
        "mgr.display_name as manager_display_name",
      )
      .join("roles as r", "r.id", "u.role_id")
      .join("branches as b", "b.id", "u.branch_id")
      .join("departments as d", "d.id", "u.department_id")
      .join("designations as des", "des.id", "u.designation_id")
      .leftJoin("users as mgr", "mgr.id", "u.manager_user_id")
      .where("u.company_id", companyId)
      .where("u.uuid", uuid)
      .whereNull("u.deleted_at")
      .whereNull("r.deleted_at")
      .first();

    if (!user) {
      return null;
    }

    return this.mapToDetail(user);
  }

  async findUserRecordByUuid(
    companyId: number,
    uuid: string,
  ): Promise<UserRecord | null> {
    const user = await this.db<UserRecord>("users")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .first();

    return user ?? null;
  }

  async createUser(
    companyId: number,
    data: CreateUserData,
    passwordHash: string,
    createdBy: number,
  ): Promise<UserDetail> {
    const [inserted] = await this.db("users")
      .insert({
        company_id: companyId,
        branch_id: data.branchId,
        department_id: data.departmentId,
        designation_id: data.designationId,
        role_id: data.roleId,
        manager_user_id: data.managerUserId ?? null,
        employee_code: data.employeeCode,
        username: data.username,
        password_hash: passwordHash,
        first_name: data.firstName,
        last_name: data.lastName ?? null,
        display_name: data.displayName ?? null,
        official_email: data.officialEmail ?? null,
        mobile: data.mobile,
        profile_photo_url: data.profilePhotoUrl ?? null,
        created_by: createdBy,
        updated_by: createdBy,
      })
      .returning("uuid");

    const user = await this.findUserByUuid(companyId, inserted.uuid);
    if (!user) {
      throw new Error("Failed to retrieve created user");
    }

    return user;
  }

  async updateUser(
    companyId: number,
    userId: number,
    data: UpdateUserData,
    updatedBy: number,
  ): Promise<UserDetail | null> {
    const updatePayload: Record<string, unknown> = {
      updated_by: updatedBy,
      updated_at: this.db.fn.now(),
    };

    if (data.branchId !== undefined) updatePayload.branch_id = data.branchId;
    if (data.departmentId !== undefined) {
      updatePayload.department_id = data.departmentId;
    }
    if (data.designationId !== undefined) {
      updatePayload.designation_id = data.designationId;
    }
    if (data.roleId !== undefined) updatePayload.role_id = data.roleId;
    if (data.managerUserId !== undefined) {
      updatePayload.manager_user_id = data.managerUserId;
    }
    if (data.employeeCode !== undefined) {
      updatePayload.employee_code = data.employeeCode;
    }
    if (data.username !== undefined) updatePayload.username = data.username;
    if (data.firstName !== undefined) updatePayload.first_name = data.firstName;
    if (data.lastName !== undefined) updatePayload.last_name = data.lastName;
    if (data.displayName !== undefined) {
      updatePayload.display_name = data.displayName;
    }
    if (data.officialEmail !== undefined) {
      updatePayload.official_email = data.officialEmail;
    }
    if (data.mobile !== undefined) updatePayload.mobile = data.mobile;
    if (data.profilePhotoUrl !== undefined) {
      updatePayload.profile_photo_url = data.profilePhotoUrl;
    }

    const updated = await this.db("users")
      .where({ id: userId, company_id: companyId })
      .whereNull("deleted_at")
      .update(updatePayload)
      .returning("uuid");

    if (!updated.length) {
      return null;
    }

    return this.findUserByUuid(companyId, updated[0].uuid);
  }

  async updateUserStatus(
    companyId: number,
    userId: number,
    status: UserStatus,
    updatedBy: number,
  ): Promise<UserDetail | null> {
    const updatePayload: Record<string, unknown> = {
      status,
      updated_by: updatedBy,
      updated_at: this.db.fn.now(),
    };

    if (status === "ACTIVE") {
      updatePayload.failed_login_attempts = 0;
      updatePayload.account_locked_until = null;
    }

    const updated = await this.db("users")
      .where({ id: userId, company_id: companyId })
      .whereNull("deleted_at")
      .update(updatePayload)
      .returning("uuid");

    if (!updated.length) {
      return null;
    }

    return this.findUserByUuid(companyId, updated[0].uuid);
  }

  async softDeleteUser(
    companyId: number,
    userId: number,
    deletedBy: number,
  ): Promise<boolean> {
    const deleted = await this.db("users")
      .where({ id: userId, company_id: companyId })
      .whereNull("deleted_at")
      .update({
        deleted_at: this.db.fn.now(),
        deleted_by: deletedBy,
        status: "INACTIVE",
        updated_at: this.db.fn.now(),
      });

    return deleted > 0;
  }

  async branchExists(
    companyId: number,
    branchId: number,
  ): Promise<OrgEntityCheck | null> {
    const branch = await this.db("branches")
      .select("id", "company_id")
      .where({ id: branchId, company_id: companyId })
      .whereNull("deleted_at")
      .first<OrgEntityCheck>();

    return branch ?? null;
  }

  async departmentExists(
    companyId: number,
    departmentId: number,
    branchId: number,
  ): Promise<OrgEntityCheck | null> {
    const department = await this.db("departments")
      .select("id", "company_id", "branch_id")
      .where({ id: departmentId, company_id: companyId, branch_id: branchId })
      .whereNull("deleted_at")
      .first<OrgEntityCheck>();

    return department ?? null;
  }

  async designationExists(
    companyId: number,
    designationId: number,
  ): Promise<OrgEntityCheck | null> {
    const designation = await this.db("designations")
      .select("id", "company_id")
      .where({ id: designationId, company_id: companyId })
      .whereNull("deleted_at")
      .first<OrgEntityCheck>();

    return designation ?? null;
  }

  async roleExists(
    companyId: number,
    roleId: number,
  ): Promise<OrgEntityCheck | null> {
    const role = await this.db("roles")
      .select("id", "company_id")
      .where({ id: roleId, company_id: companyId })
      .whereNull("deleted_at")
      .first<OrgEntityCheck>();

    return role ?? null;
  }

  async managerExists(
    companyId: number,
    managerUserId: number,
  ): Promise<OrgEntityCheck | null> {
    const manager = await this.db("users")
      .select("id", "company_id")
      .where({ id: managerUserId, company_id: companyId })
      .whereNull("deleted_at")
      .where("status", "ACTIVE")
      .first<OrgEntityCheck>();

    return manager ?? null;
  }

  async isEmployeeCodeTaken(
    companyId: number,
    employeeCode: string,
    excludeUserId?: number,
  ): Promise<boolean> {
    const query = this.db("users")
      .where({ company_id: companyId })
      .whereRaw("LOWER(employee_code) = LOWER(?)", [employeeCode])
      .whereNull("deleted_at");

    if (excludeUserId) {
      query.whereNot("id", excludeUserId);
    }

    const existing = await query.first();
    return Boolean(existing);
  }

  async isUsernameTaken(
    companyId: number,
    username: string,
    excludeUserId?: number,
  ): Promise<boolean> {
    const query = this.db("users")
      .where({ company_id: companyId })
      .whereRaw("LOWER(username) = LOWER(?)", [username])
      .whereNull("deleted_at");

    if (excludeUserId) {
      query.whereNot("id", excludeUserId);
    }

    const existing = await query.first();
    return Boolean(existing);
  }

  async isEmailTaken(
    companyId: number,
    email: string,
    excludeUserId?: number,
  ): Promise<boolean> {
    const query = this.db("users")
      .where({ company_id: companyId })
      .whereRaw("LOWER(official_email) = LOWER(?)", [email])
      .whereNull("deleted_at");

    if (excludeUserId) {
      query.whereNot("id", excludeUserId);
    }

    const existing = await query.first();
    return Boolean(existing);
  }

  private mapToListItem(row: Record<string, unknown>): UserListItem {
    return {
      id: row.id as number,
      uuid: row.uuid as string,
      employeeCode: row.employee_code as string,
      username: row.username as string,
      firstName: row.first_name as string,
      lastName: row.last_name as string | null,
      displayName: row.display_name as string | null,
      officialEmail: row.official_email as string | null,
      mobile: row.mobile as string,
      status: row.status as UserStatus,
      lastLoginAt: row.last_login_at as Date | null,
      role: {
        id: row.role_id as number,
        code: row.role_code as string,
        name: row.role_name as string,
      },
      branch: {
        id: row.branch_id as number,
        name: row.branch_name as string,
      },
      department: {
        id: row.department_id as number,
        name: row.department_name as string,
      },
      designation: {
        id: row.designation_id as number,
        name: row.designation_name as string,
      },
      manager: row.manager_user_id
        ? {
            id: row.manager_user_id as number,
            uuid: row.manager_uuid as string,
            displayName: row.manager_display_name as string | null,
          }
        : null,
      createdAt: row.created_at as Date,
    };
  }

  private mapToDetail(row: Record<string, unknown>): UserDetail {
    return {
      id: row.id as number,
      uuid: row.uuid as string,
      employeeCode: row.employee_code as string,
      username: row.username as string,
      firstName: row.first_name as string,
      lastName: row.last_name as string | null,
      displayName: row.display_name as string | null,
      officialEmail: row.official_email as string | null,
      mobile: row.mobile as string,
      profilePhotoUrl: row.profile_photo_url as string | null,
      status: row.status as UserStatus,
      emailVerified: row.email_verified as boolean,
      mobileVerified: row.mobile_verified as boolean,
      lastLoginAt: row.last_login_at as Date | null,
      passwordChangedAt: row.password_changed_at as Date | null,
      role: {
        id: row.role_id as number,
        uuid: row.role_uuid as string,
        code: row.role_code as string,
        name: row.role_name as string,
      },
      branch: {
        id: row.branch_id as number,
        uuid: row.branch_uuid as string,
        name: row.branch_name as string,
      },
      department: {
        id: row.department_id as number,
        uuid: row.department_uuid as string,
        name: row.department_name as string,
      },
      designation: {
        id: row.designation_id as number,
        uuid: row.designation_uuid as string,
        name: row.designation_name as string,
      },
      manager: row.manager_id
        ? {
            id: row.manager_id as number,
            uuid: row.manager_uuid as string,
            employeeCode: row.manager_employee_code as string,
            displayName: row.manager_display_name as string | null,
          }
        : null,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    };
  }
}
