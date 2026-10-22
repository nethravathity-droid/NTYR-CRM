import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/utils/validate.js";
import { InvoicesController } from "./invoice.controller.js";
import { invoicesService } from "./invoice.service.js";
import {
  createInvoiceSchema,
  deleteInvoiceSchema,
  getInvoiceAuditSchema,
  getInvoiceSchema,
  listInvoicesSchema,
  updateInvoiceSchema,
} from "./invoice.validation.js";

const invoicesController = new InvoicesController(invoicesService);
const router = Router();

router.use(authenticate);

router.get("/form-options", authorize("invoices.view"), invoicesController.getFormOptions);
router.get("/", authorize("invoices.view"), validate(listInvoicesSchema), invoicesController.list);
router.get("/:uuid/audit-trail", authorize("invoices.view"), validate(getInvoiceAuditSchema), invoicesController.getAuditTrail);
router.get("/:uuid", authorize("invoices.view"), validate(getInvoiceSchema), invoicesController.getByUuid);
router.post("/", authorize("invoices.create"), validate(createInvoiceSchema), invoicesController.create);
router.put("/:uuid", authorize("invoices.update"), validate(getInvoiceSchema), validate(updateInvoiceSchema), invoicesController.update);
router.delete("/:uuid", authorize("invoices.delete"), validate(deleteInvoiceSchema), invoicesController.remove);

export default router;
