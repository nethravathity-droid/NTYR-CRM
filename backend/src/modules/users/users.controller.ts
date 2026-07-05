import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import type { UsersService } from "./users.service.js";
import type {
  createUserSchema,
  deleteUserSchema,
  getUserSchema,
  listUsersSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from "./users.validation.js";
import type { z } from "zod";

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
