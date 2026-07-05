import { createHash, randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Logger } from "winston";
import { db } from "../../database/knex.js";
import { logger } from "../../config/logger.js";
import { env } from "../../config/env.js";
import { AppError } from "../../middleware/errorHandler.js";
import { AuthRepository } from "./auth.repository.js";
import type {
  AccessTokenPayload,
  AuthTokens,
  LoginResult,
  RefreshTokenPayload,
  RequestMetadata,
  UserAuthRecord,
  UserProfile,
} from "./auth.types.js";
import type {
  ChangePasswordInput,
  LoginInput,
  LogoutInput,
  RefreshTokenInput,
} from "./auth.validation.js";

export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly logger: Logger,
  ) {}

  async login(
    input: LoginInput,
    metadata: RequestMetadata,
  ): Promise<LoginResult> {
    const company = await this.authRepository.findCompanyByCode(
      input.companyCode,
    );

    if (!company) {
      this.logger.warn("Login failed: company not found", {
        companyCode: input.companyCode,
      });
      throw new AppError(401, "Invalid company code or credentials");
    }

    this.assertCompanyIsActive(company.status);

    const user = await this.authRepository.findUserForLogin(
      company.id,
      input.username,
    );

    if (!user) {
      this.logger.warn("Login failed: user not found", {
        companyId: company.id,
        username: input.username,
      });
      throw new AppError(401, "Invalid company code or credentials");
    }

    await this.assertUserCanAuthenticate(user);

    const isPasswordValid = await bcrypt.compare(
      input.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      throw new AppError(401, "Invalid company code or credentials");
    }

    const permissions = await this.authRepository.getPermissionsByRoleId(
      user.role_id,
    );

    const tokens = await this.issueTokenPair(user, permissions, metadata);

    await this.authRepository.recordSuccessfulLogin(
      user.id,
      metadata.ipAddress,
      metadata.userAgent,
    );

    const profile = this.mapUserToProfile(user, permissions);

    this.logger.info("User logged in successfully", {
      userId: user.id,
      companyId: user.company_id,
      roleCode: user.role_code,
    });

    return { user: profile, tokens };
  }

  async refresh(
    input: RefreshTokenInput,
    metadata: RequestMetadata,
  ): Promise<AuthTokens> {
    const payload = this.verifyRefreshToken(input.refreshToken);
    const storedToken = await this.authRepository.findRefreshTokenByJti(
      payload.jti,
    );

    if (!storedToken) {
      throw new AppError(401, "Invalid or expired refresh token");
    }

    this.assertTokenHash(input.refreshToken, storedToken.token_hash);

    if (
      storedToken.user_id !== payload.userId ||
      storedToken.company_id !== payload.companyId
    ) {
      await this.authRepository.revokeRefreshToken(payload.jti);
      throw new AppError(401, "Invalid refresh token");
    }

    const user = await this.authRepository.findUserById(
      payload.userId,
      payload.companyId,
    );

    if (!user) {
      await this.authRepository.revokeRefreshToken(payload.jti);
      throw new AppError(401, "User account is no longer available");
    }

    await this.assertUserCanAuthenticate(user);
    this.assertCompanyIsActive(user.company_status);

    const permissions = await this.authRepository.getPermissionsByRoleId(
      user.role_id,
    );

    const newJti = randomUUID();
    const tokens = this.generateTokens(user, permissions, newJti);
    const newRefreshExpiry = this.getRefreshTokenExpiryDate();

    await this.authRepository.createRefreshToken({
      userId: user.id,
      companyId: user.company_id,
      tokenJti: newJti,
      tokenHash: this.hashToken(tokens.refreshToken),
      expiresAt: newRefreshExpiry,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    await this.authRepository.revokeRefreshToken(payload.jti, newJti);

    this.logger.info("Access token refreshed", {
      userId: user.id,
      companyId: user.company_id,
    });

    return tokens;
  }

  async logout(input: LogoutInput): Promise<void> {
    try {
      const payload = this.verifyRefreshToken(input.refreshToken);
      await this.authRepository.revokeRefreshToken(payload.jti);

      this.logger.info("User logged out", {
        userId: payload.userId,
        companyId: payload.companyId,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(401, "Invalid refresh token");
    }
  }

  async changePassword(
    userId: number,
    companyId: number,
    input: ChangePasswordInput,
  ): Promise<void> {
    const currentHash = await this.authRepository.findUserPasswordHash(userId);

    if (!currentHash) {
      throw new AppError(404, "User not found");
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      input.currentPassword,
      currentHash,
    );

    if (!isCurrentPasswordValid) {
      throw new AppError(400, "Current password is incorrect");
    }

    const newPasswordHash = await bcrypt.hash(
      input.newPassword,
      env.BCRYPT_ROUNDS,
    );

    await this.authRepository.updatePassword(userId, newPasswordHash);
    await this.authRepository.revokeAllUserRefreshTokens(userId);

    this.logger.info("Password changed successfully", {
      userId,
      companyId,
    });
  }

  async getCurrentUser(
    userId: number,
    companyId: number,
  ): Promise<UserProfile> {
    const profile = await this.authRepository.findUserProfileById(
      userId,
      companyId,
    );

    if (!profile) {
      throw new AppError(404, "User not found");
    }

    if (profile.status !== "ACTIVE") {
      throw new AppError(403, "User account is not active");
    }

    if (!["TRIAL", "ACTIVE"].includes(profile.company.status)) {
      throw new AppError(403, "Company account is not active");
    }

    return profile;
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const payload = jwt.verify(
        token,
        env.JWT_ACCESS_SECRET,
      ) as AccessTokenPayload;

      if (payload.type !== "access") {
        throw new AppError(401, "Invalid access token");
      }

      return payload;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(401, "Invalid or expired access token");
    }
  }

  mapAccessPayloadToUser(payload: AccessTokenPayload) {
    return {
      id: payload.userId,
      uuid: payload.sub,
      companyId: payload.companyId,
      companyUuid: payload.companyUuid,
      companyCode: payload.companyCode,
      roleId: payload.roleId,
      roleCode: payload.roleCode,
      permissions: payload.permissions,
    };
  }

  private async issueTokenPair(
    user: UserAuthRecord,
    permissions: string[],
    metadata: RequestMetadata,
  ): Promise<AuthTokens> {
    const tokenJti = randomUUID();
    const tokens = this.generateTokens(user, permissions, tokenJti);

    await this.authRepository.createRefreshToken({
      userId: user.id,
      companyId: user.company_id,
      tokenJti,
      tokenHash: this.hashToken(tokens.refreshToken),
      expiresAt: this.getRefreshTokenExpiryDate(),
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    return tokens;
  }

  private generateTokens(
    user: UserAuthRecord,
    permissions: string[],
    refreshTokenJti: string,
  ): AuthTokens {
    const accessPayload: AccessTokenPayload = {
      sub: user.uuid,
      userId: user.id,
      companyId: user.company_id,
      companyUuid: user.company_uuid,
      companyCode: user.company_code,
      roleId: user.role_id,
      roleCode: user.role_code,
      permissions,
      type: "access",
    };

    const refreshPayload: RefreshTokenPayload = {
      sub: user.username,
      userId: user.id,
      companyId: user.company_id,
      jti: refreshTokenJti,
      type: "refresh",
    };

    const accessToken = jwt.sign(accessPayload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });

    const refreshToken = jwt.sign(refreshPayload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getAccessTokenExpirySeconds(),
    };
  }

  private verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const payload = jwt.verify(
        token,
        env.JWT_REFRESH_SECRET,
      ) as RefreshTokenPayload;

      if (payload.type !== "refresh" || !payload.jti) {
        throw new AppError(401, "Invalid refresh token");
      }

      return payload;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(401, "Invalid or expired refresh token");
    }
  }

  private async assertUserCanAuthenticate(user: UserAuthRecord): Promise<void> {
    if (user.deleted_at) {
      throw new AppError(403, "User account is not available");
    }

    if (user.status === "INACTIVE") {
      throw new AppError(403, "User account is inactive");
    }

    if (
      user.account_locked_until &&
      user.account_locked_until.getTime() > Date.now()
    ) {
      throw new AppError(
        423,
        "Account is temporarily locked due to multiple failed login attempts",
      );
    }

    if (user.status === "LOCKED") {
      if (
        user.account_locked_until &&
        user.account_locked_until.getTime() <= Date.now()
      ) {
        return;
      }
      throw new AppError(423, "User account is locked");
    }
  }

  private assertCompanyIsActive(status: UserAuthRecord["company_status"]): void {
    if (status === "SUSPENDED") {
      throw new AppError(403, "Company account is suspended");
    }

    if (status === "EXPIRED") {
      throw new AppError(403, "Company subscription has expired");
    }
  }

  private async handleFailedLogin(user: UserAuthRecord): Promise<void> {
    const attempts = await this.authRepository.incrementFailedLoginAttempts(
      user.id,
    );

    this.logger.warn("Invalid login attempt", {
      userId: user.id,
      companyId: user.company_id,
      attempts,
    });

    if (attempts >= env.MAX_LOGIN_ATTEMPTS) {
      const lockedUntil = new Date(
        Date.now() + env.ACCOUNT_LOCK_DURATION_MINUTES * 60 * 1000,
      );
      await this.authRepository.lockUserAccount(user.id, lockedUntil);

      this.logger.warn("User account locked after failed attempts", {
        userId: user.id,
        lockedUntil,
      });
    }
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private assertTokenHash(token: string, storedHash: string): void {
    const computedHash = this.hashToken(token);
    if (computedHash !== storedHash) {
      throw new AppError(401, "Invalid refresh token");
    }
  }

  private getAccessTokenExpirySeconds(): number {
    const match = /^(\d+)([smhd])$/.exec(env.JWT_ACCESS_EXPIRES_IN);
    if (!match) {
      return 900;
    }

    const value = Number(match[1]);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 3600;
      case "d":
        return value * 86400;
      default:
        return 900;
    }
  }

  private getRefreshTokenExpiryDate(): Date {
    const seconds = this.parseDurationToSeconds(env.JWT_REFRESH_EXPIRES_IN);
    return new Date(Date.now() + seconds * 1000);
  }

  private parseDurationToSeconds(duration: string): number {
    const match = /^(\d+)([smhd])$/.exec(duration);
    if (!match) {
      return 7 * 24 * 60 * 60;
    }

    const value = Number(match[1]);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 3600;
      case "d":
        return value * 86400;
      default:
        return 7 * 24 * 60 * 60;
    }
  }

  private mapUserToProfile(
    user: UserAuthRecord,
    permissions: string[],
  ): UserProfile {
    return {
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
      lastLoginAt: user.last_login_at,
      emailVerified: user.email_verified,
      mobileVerified: user.mobile_verified,
      company: {
        id: user.company_id,
        uuid: user.company_uuid,
        code: user.company_code,
        name: user.company_name,
        status: user.company_status,
      },
      organization: {
        branchId: user.branch_id,
        branchName: user.branch_name,
        departmentId: user.department_id,
        departmentName: user.department_name,
        designationId: user.designation_id,
        designationName: user.designation_name,
      },
      role: {
        id: user.role_id,
        code: user.role_code,
        name: user.role_name,
      },
      permissions,
    };
  }
}

export const authService = new AuthService(new AuthRepository(db), logger);
