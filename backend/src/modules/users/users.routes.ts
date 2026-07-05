import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/utils/validate.js";
import { UsersController } from "./users.controller.js";
import { usersService } from "./users.service.js";
import {
  createUserSchema,
  deleteUserSchema,
  getUserSchema,
  listUsersSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from "./users.validation.js";

const usersController = new UsersController(usersService);

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize("users.view"),
  validate(listUsersSchema),
  usersController.list,
);

router.post(
  "/",
  authorize("users.create"),
  validate(createUserSchema),
  usersController.create,
);

router.get(
  "/:uuid",
  authorize("users.view"),
  validate(getUserSchema),
  usersController.getByUuid,
);

router.put(
  "/:uuid",
  authorize("users.update"),
  validate(updateUserSchema),
  usersController.update,
);

router.patch(
  "/:uuid/status",
  authorize("users.update"),
  validate(updateUserStatusSchema),
  usersController.updateStatus,
);

router.delete(
  "/:uuid",
  authorize("users.delete"),
  validate(deleteUserSchema),
  usersController.remove,
);

export default router;
