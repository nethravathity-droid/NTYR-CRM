import type { Request, Response } from "express";
import type { z } from "zod";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import type { UsersService } from "./users.service.js";
import type {
  createUserSchema,
  deleteUserSchema,
  getUserSchema,
  listUsersSchema,
  resetUserPasswordSchema,
  updateUserSchema,
  updateUserStatusSchema,
  userFormOptionsSchema,
} from "./users.validation.js";

type ListUsersRequest = Request & {
  validated: z.infer<typeof listUsersSchema>;
};
type CreateUserRequest = Request & {
  validated: z.infer<typeof createUserSchema>;
};
type GetUserRequest = Request & { validated: z.infer<typeof getUserSchema> };
type UpdateUserRequest = Request & {
  validated: z.infer<typeof updateUserSchema>;
};
type UpdateUserStatusRequest = Request & {
  validated: z.infer<typeof updateUserStatusSchema>;
};
type ResetUserPasswordRequest = Request & {
  validated: z.infer<typeof resetUserPasswordSchema>;
};
type UserFormOptionsRequest = Request & {
  validated: z.infer<typeof userFormOptionsSchema>;
};
type DeleteUserRequest = Request & {
  validated: z.infer<typeof deleteUserSchema>;
};

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ListUsersRequest).validated;

    const result = await this.usersService.listUsers(req.user!.companyId, query);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
  });

  getFormOptions = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { query } = (req as UserFormOptionsRequest).validated;

      const options = await this.usersService.getFormOptions(
        req.user!.companyId,
        query,
      );

      res.status(200).json({
        success: true,
        message: "User form options retrieved successfully",
        data: options,
      });
    },
  );

  getByUuid = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { params } = (req as GetUserRequest).validated;

      const user = await this.usersService.getUserByUuid(
        req.user!.companyId,
        params.uuid,
      );

      res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: { user },
      });
    },
  );

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { body } = (req as CreateUserRequest).validated;

    const user = await this.usersService.createUser(
      req.user!.companyId,
      body,
      req.user!.id,
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { user },
    });
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params, body } = (req as UpdateUserRequest).validated;

    const user = await this.usersService.updateUser(
      req.user!.companyId,
      params.uuid,
      body,
      req.user!.id,
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: { user },
    });
  });

  updateStatus = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { params, body } = (req as UpdateUserStatusRequest).validated;

      const user = await this.usersService.updateUserStatus(
        req.user!.companyId,
        params.uuid,
        body,
        req.user!.id,
      );

      res.status(200).json({
        success: true,
        message: "User status updated successfully",
        data: { user },
      });
    },
  );

  resetPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { params, body } = (req as ResetUserPasswordRequest).validated;

      await this.usersService.resetUserPassword(
        req.user!.companyId,
        params.uuid,
        body,
        req.user!.id,
      );

      res.status(200).json({
        success: true,
        message: "Password reset successfully",
      });
    },
  );

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as DeleteUserRequest).validated;

    await this.usersService.deleteUser(
      req.user!.companyId,
      params.uuid,
      req.user!.id,
    );

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  });
}
