import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/utils/validate.js";
import { PaymentsController } from "./payment.controller.js";
import { paymentsService } from "./payment.service.js";
import {
  deletePaymentSchema,
  getPaymentAuditSchema,
  getPaymentSchema,
  listPaymentsSchema,
  schedulePaymentsSchema,
  updatePaymentSchema,
} from "./payment.validation.js";

const paymentsController = new PaymentsController(paymentsService);
const router = Router();

const receiptUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const lowerName = file.originalname.toLowerCase();
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
    callback(null, allowed.some((ext) => lowerName.endsWith(ext)));
  },
});

router.use(authenticate);

router.get("/form-options", authorize("payments.view"), paymentsController.getFormOptions);
router.get("/outstanding", authorize("payments.view"), paymentsController.getOutstanding);
router.get("/overdue", authorize("payments.view"), paymentsController.getOverdue);
router.get("/collection-summary", authorize("payments.view"), paymentsController.getCollectionSummary);
router.get("/schedule", authorize("payments.view"), validate(schedulePaymentsSchema), paymentsController.getSchedule);
router.get("/", authorize("payments.view"), validate(listPaymentsSchema), paymentsController.list);
router.get("/:uuid/audit-trail", authorize("payments.view"), validate(getPaymentAuditSchema), paymentsController.getAuditTrail);
router.get("/:uuid", authorize("payments.view"), validate(getPaymentSchema), paymentsController.getByUuid);
router.post("/", authorize("payments.create"), receiptUpload.single("receipt"), paymentsController.create);
router.put("/:uuid", authorize("payments.update"), validate(getPaymentSchema), receiptUpload.single("receipt"), paymentsController.update);
router.post("/:uuid/receipt", authorize("payments.update"), validate(getPaymentSchema), receiptUpload.single("receipt"), paymentsController.uploadReceipt);
router.delete("/:uuid", authorize("payments.delete"), validate(deletePaymentSchema), paymentsController.remove);

export default router;
