import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/utils/validate.js";
import { LeadsController } from "./leads.controller.js";
import { leadsService } from "./leads.service.js";
import {
  assignLeadsSchema,
  bulkUpdateLeadsSchema,
  checkDuplicateSchema,
  createLeadSchema,
  deleteLeadSchema,
  getLeadAuditSchema,
  getLeadSchema,
  listLeadsSchema,
  updateLeadSchema,
} from "./leads.validation.js";

const leadsController = new LeadsController(leadsService);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowed = [".csv", ".xlsx", ".xls"];
    const lowerName = file.originalname.toLowerCase();
    const isAllowed = allowed.some((ext) => lowerName.endsWith(ext));

    if (!isAllowed) {
      callback(new Error("Only CSV and Excel files are allowed"));
      return;
    }

    callback(null, true);
  },
});

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize("leads.view"),
  validate(listLeadsSchema),
  leadsController.list,
);

router.get(
  "/form-options",
  authorize("leads.view"),
  leadsController.getFormOptions,
);

router.get(
  "/check-duplicates",
  authorize("leads.view"),
  validate(checkDuplicateSchema),
  leadsController.checkDuplicates,
);

router.post(
  "/import",
  authorize("leads.create"),
  upload.single("file"),
  leadsController.importLeads,
);

router.post(
  "/assign",
  authorize("leads.update"),
  validate(assignLeadsSchema),
  leadsController.assign,
);

router.post(
  "/bulk-update",
  authorize("leads.update"),
  validate(bulkUpdateLeadsSchema),
  leadsController.bulkUpdate,
);

router.post(
  "/",
  authorize("leads.create"),
  validate(createLeadSchema),
  leadsController.create,
);

router.get(
  "/:uuid/audit-trail",
  authorize("leads.view"),
  validate(getLeadAuditSchema),
  leadsController.getAuditTrail,
);

router.get(
  "/:uuid",
  authorize("leads.view"),
  validate(getLeadSchema),
  leadsController.getByUuid,
);

router.put(
  "/:uuid",
  authorize("leads.update"),
  validate(updateLeadSchema),
  leadsController.update,
);

router.delete(
  "/:uuid",
  authorize("leads.delete"),
  validate(deleteLeadSchema),
  leadsController.remove,
);

export default router;
