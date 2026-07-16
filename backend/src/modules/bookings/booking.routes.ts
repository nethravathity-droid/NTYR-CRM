import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/utils/validate.js";
import { BookingsController } from "./booking.controller.js";
import { bookingsService } from "./booking.service.js";
import {
  approveBookingSchema,
  cancelBookingSchema,
  createBookingSchema,
  deleteBookingSchema,
  getBookingAuditSchema,
  getBookingSchema,
  listBookingsSchema,
  rejectBookingSchema,
  updateBookingSchema,
  uploadBookingDocumentSchema,
} from "./booking.validation.js";

const bookingsController = new BookingsController(bookingsService);
const router = Router();

const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const lowerName = file.originalname.toLowerCase();
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
    callback(null, allowed.some((ext) => lowerName.endsWith(ext)));
  },
});

router.use(authenticate);

router.get("/form-options", authorize("bookings.view"), bookingsController.getFormOptions);
router.get("/", authorize("bookings.view"), validate(listBookingsSchema), bookingsController.list);
router.get("/:uuid/audit-trail", authorize("bookings.view"), validate(getBookingAuditSchema), bookingsController.getAuditTrail);
router.get("/:uuid", authorize("bookings.view"), validate(getBookingSchema), bookingsController.getByUuid);
router.post("/", authorize("bookings.create"), validate(createBookingSchema), bookingsController.create);
router.put("/:uuid", authorize("bookings.update"), validate(updateBookingSchema), bookingsController.update);
router.delete("/:uuid", authorize("bookings.delete"), validate(deleteBookingSchema), bookingsController.remove);
router.patch("/:uuid/approve", authorize("bookings.update"), validate(approveBookingSchema), bookingsController.approve);
router.patch("/:uuid/reject", authorize("bookings.update"), validate(rejectBookingSchema), bookingsController.reject);
router.patch("/:uuid/cancel", authorize("bookings.update"), validate(cancelBookingSchema), bookingsController.cancel);
router.post(
  "/:uuid/documents",
  authorize("bookings.update"),
  documentUpload.single("file"),
  validate(uploadBookingDocumentSchema),
  bookingsController.uploadDocument,
);

export default router;
