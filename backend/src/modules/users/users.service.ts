import bcrypt from "bcrypt";
import type { Logger } from "winston";
import { db } from "../../database/knex.js";
import { logger } from "../../config/logger.js";
import { env } from "../../config/env.js";
import { AppError } from "../../common/errors/AppError.js";
import { UsersRepository } from "./users.repository.js";
import type {
  PaginatedUsersResult,
  UpdateUserData,
  UserDetail,
} from "./users.types.js";
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
  UpdateUserStatusInput,
} from "./users.validation.js";

export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: Logger,
  ) {}

  async listUsers(
    companyId: number,
    query: ListUsersQuery,
  ): Promise<PaginatedUsersResult> {
    if (query.branchId) {
      await this.assertBranchBelongsToCompany(companyId, query.branchId);
    }

    if (query.departmentId && query.branchId) {
      await this.assertDepartmentBelongsToCompany(
        companyId,
        query.departmentId,
        query.branchId,
      );
    }

    return this.usersRepository.listUsers(companyId, query);
  }

  async getUserByUuid(companyId: number, uuid: string): Promise<UserDetail> {
    const user = await this.usersRepository.findUserByUuid(companyId, uuid);

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return user;
  }

  async createUser(
    companyId: number,
    input: CreateUserInput,
    createdBy: number,
  ): Promise<UserDetail> {
    await this.validateOrganizationReferences(companyId, {
      branchId: input.branchId,
      departmentId: input.departmentId,
      designationId: input.designationId,
      roleId: input.roleId,
      managerUserId: input.managerUserId,
    });

    await this.assertUniqueUserFields(companyId, {
      employeeCode: input.employeeCode,
      username: input.username,
      officialEmail: input.officialEmail,
    });

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);

    const user = await this.usersRepository.createUser(
      companyId,
      {
        branchId: input.branchId,
        departmentId: input.departmentId,
        designationId: input.designationId,
        roleId: input.roleId,
        managerUserId: input.managerUserId,
        employeeCode: input.employeeCode,
        username: input.username,
        password: input.password,
        firstName: input.firstName,
        lastName: input.lastName,
        displayName: input.displayName,
        officialEmail: input.officialEmail,
        mobile: input.mobile,
        profilePhotoUrl: input.profilePhotoUrl,
      },
      passwordHash,
      createdBy,
    );

    this.logger.info("User created", {
      companyId,
      userId: user.id,
      createdBy,
    });

    return user;
  }

  async updateUser(
    companyId: number,
    uuid: string,
    input: UpdateUserInput,
    updatedBy: number,
  ): Promise<UserDetail> {
    const existing = await this.usersRepository.findUserRecordByUuid(
      companyId,
      uuid,
    );

    if (!existing) {
      throw new AppError(404, "User not found");
    }

    if (existing.id === updatedBy && input.roleId && input.roleId !== existing.role_id) {
      throw new AppError(400, "You cannot change your own role");
    }

    const branchId = input.branchId ?? existing.branch_id;
    const departmentId = input.departmentId ?? existing.department_id;

    await this.validateOrganizationReferences(companyId, {
      branchId: input.branchId,
      departmentId: input.departmentId,
      designationId: input.designationId,
      roleId: input.roleId,
      managerUserId: input.managerUserId,
      resolvedBranchId: branchId,
      resolvedDepartmentId: departmentId,
      excludeUserId: existing.id,
    });

    await this.assertUniqueUserFields(
      companyId,
      {
        employeeCode: input.employeeCode,
        username: input.username,
        officialEmail: input.officialEmail,
      },
      existing.id,
    );

    const updateData: UpdateUserData = {
      branchId: input.branchId,
      departmentId: input.departmentId,
      designationId: input.designationId,
      roleId: input.roleId,
      managerUserId: input.managerUserId,
      employeeCode: input.employeeCode,
      username: input.username,
      firstName: input.firstName,
      lastName: input.lastName,
      displayName: input.displayName,
      officialEmail: input.officialEmail,
      mobile: input.mobile,
      profilePhotoUrl: input.profilePhotoUrl,
    };

    const user = await this.usersRepository.updateUser(
      companyId,
      existing.id,
      updateData,
      updatedBy,
    );

    if (!user) {
      throw new AppError(404, "User not found");
    }

    this.logger.info("User updated", {
      companyId,
      userId: user.id,
      updatedBy,
    });

    return user;
  }

  async updateUserStatus(
    companyId: number,
    uuid: string,
    input: UpdateUserStatusInput,
    updatedBy: number,
  ): Promise<UserDetail> {
    const existing = await this.usersRepository.findUserRecordByUuid(
      companyId,
      uuid,
    );

    if (!existing) {
      throw new AppError(404, "User not found");
    }

    if (existing.id === updatedBy && input.status !== "ACTIVE") {
      throw new AppError(400, "You cannot deactivate or lock your own account");
    }

    const user = await this.usersRepository.updateUserStatus(
      companyId,
      existing.id,
      input.status,
      updatedBy,
    );

    if (!user) {
      throw new AppError(404, "User not found");
    }

    this.logger.info("User status updated", {
      companyId,
      userId: user.id,
      status: input.status,
      updatedBy,
    });

    return user;
  }

  async deleteUser(
    companyId: number,
    uuid: string,
    deletedBy: number,
  ): Promise<void> {
    const existing = await this.usersRepository.findUserRecordByUuid(
      companyId,
      uuid,
    );

    if (!existing) {
      throw new AppError(404, "User not found");
    }

    if (existing.id === deletedBy) {
      throw new AppError(400, "You cannot delete your own account");
    }

    const deleted = await this.usersRepository.softDeleteUser(
      companyId,
      existing.id,
      deletedBy,
    );

    if (!deleted) {
      throw new AppError(404, "User not found");
    }

    this.logger.info("User soft deleted", {
      companyId,
      userId: existing.id,
      deletedBy,
    });
  }

  private async validateOrganizationReferences(
    companyId: number,
    refs: {
      branchId?: number;
      departmentId?: number;
      designationId?: number;
      roleId?: number;
      managerUserId?: number | null;
      resolvedBranchId?: number;
      resolvedDepartmentId?: number;
      excludeUserId?: number;
    },
  ): Promise<void> {
    const branchId = refs.branchId ?? refs.resolvedBranchId;

    if (refs.branchId) {
      await this.assertBranchBelongsToCompany(companyId, refs.branchId);
    }

    if (refs.departmentId) {
      if (!branchId) {
        throw new AppError(400, "Branch is required when assigning a department");
      }
      await this.assertDepartmentBelongsToCompany(
        companyId,
        refs.departmentId,
        branchId,
      );
    }

    if (refs.designationId) {
      const designation = await this.usersRepository.designationExists(
        companyId,
        refs.designationId,
      );
      if (!designation) {
        throw new AppError(400, "Invalid designation for this company");
      }
    }

    if (refs.roleId) {
      const role = await this.usersRepository.roleExists(companyId, refs.roleId);
      if (!role) {
        throw new AppError(400, "Invalid role for this company");
      }
    }

    if (refs.managerUserId) {
      if (refs.excludeUserId && refs.managerUserId === refs.excludeUserId) {
        throw new AppError(400, "User cannot be their own manager");
      }

      const manager = await this.usersRepository.managerExists(
        companyId,
        refs.managerUserId,
      );
      if (!manager) {
        throw new AppError(400, "Invalid manager for this company");
      }
    }
  }

  private async assertBranchBelongsToCompany(
    companyId: number,
    branchId: number,
  ): Promise<void> {
    const branch = await this.usersRepository.branchExists(companyId, branchId);
    if (!branch) {
      throw new AppError(400, "Invalid branch for this company");
    }
  }

  private async assertDepartmentBelongsToCompany(
    companyId: number,
    departmentId: number,
    branchId: number,
  ): Promise<void> {
    const department = await this.usersRepository.departmentExists(
      companyId,
      departmentId,
      branchId,
    );
    if (!department) {
      throw new AppError(400, "Invalid department for this branch");
    }
  }

  private async assertUniqueUserFields(
    companyId: number,
    fields: {
      employeeCode?: string;
      username?: string;
      officialEmail?: string | null;
    },
    excludeUserId?: number,
  ): Promise<void> {
    if (fields.employeeCode) {
      const taken = await this.usersRepository.isEmployeeCodeTaken(
        companyId,
        fields.employeeCode,
        excludeUserId,
      );
      if (taken) {
        throw new AppError(409, "Employee code already exists in this company");
      }
    }

    if (fields.username) {
      const taken = await this.usersRepository.isUsernameTaken(
        companyId,
        fields.username,
        excludeUserId,
      );
      if (taken) {
        throw new AppError(409, "Username already exists in this company");
      }
    }

    if (fields.officialEmail) {
      const taken = await this.usersRepository.isEmailTaken(
        companyId,
        fields.officialEmail,
        excludeUserId,
      );
      if (taken) {
        throw new AppError(409, "Official email already exists in this company");
      }
    }
  }
}

export const usersService = new UsersService(new UsersRepository(db), logger);
