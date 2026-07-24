import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize, authorizeRoles } from "../../common/middleware/authorize.js";
import { validate } from "../../common/utils/validate.js";
import { CompaniesController } from "./companies.controller.js";
import { companiesService } from "./companies.service.js";
import {
  createCompanySchema,
  deleteCompanySchema,
  getCompanyLoginSetupSchema,
  getCompanySchema,
  listCompaniesSchema,
  provisionInitialAdminSchema,
  updateCompanyActiveSchema,
  updateCompanySchema,
  updateCompanyStatusSchema,
} from "./companies.validation.js";

const companiesController = new CompaniesController(companiesService);

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("PLATFORM_SUPER_ADMIN"));

router.get(
  "/",
  authorize("companies.view"),
  validate(listCompaniesSchema),
  companiesController.list,
);

router.post(
  "/",
  authorize("companies.create"),
  validate(createCompanySchema),
  companiesController.create,
);

router.get(
  "/:uuid/login-setup",
  authorize("companies.view"),
  validate(getCompanyLoginSetupSchema),
  companiesController.getLoginSetup,
);

router.post(
  "/:uuid/provision-admin",
  authorize("companies.update"),
  validate(provisionInitialAdminSchema),
  companiesController.provisionInitialAdmin,
);

router.get(
  "/:uuid",
  authorize("companies.view"),
  validate(getCompanySchema),
  companiesController.getByUuid,
);

router.put(
  "/:uuid",
  authorize("companies.update"),
  validate(updateCompanySchema),
  companiesController.update,
);

router.patch(
  "/:uuid/status",
  authorize("companies.update"),
  validate(updateCompanyStatusSchema),
  companiesController.updateStatus,
);

router.patch(
  "/:uuid/active",
  authorize("companies.update"),
  validate(updateCompanyActiveSchema),
  companiesController.updateActive,
);

router.delete(
  "/:uuid",
  authorize("companies.delete"),
  validate(deleteCompanySchema),
  companiesController.remove,
);

export default router;
