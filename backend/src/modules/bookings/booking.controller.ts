import type { Request, Response } from "express";
import type { z } from "zod";
import { AppError } from "../../common/errors/AppError.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import type { BookingsService } from "./booking.service.js";
import type {
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

type ListBookingsRequest = Request & { validated: z.infer<typeof listBookingsSchema> };
type CreateBookingRequest = Request & { validated: z.infer<typeof createBookingSchema> };
type GetBookingRequest = Request & { validated: z.infer<typeof getBookingSchema> };
type UpdateBookingRequest = Request & { validated: z.infer<typeof updateBookingSchema> };
type DeleteBookingRequest = Request & { validated: z.infer<typeof deleteBookingSchema> };
type ApproveBookingRequest = Request & { validated: z.infer<typeof approveBookingSchema> };
type RejectBookingRequest = Request & { validated: z.infer<typeof rejectBookingSchema> };
type CancelBookingRequest = Request & { validated: z.infer<typeof cancelBookingSchema> };
type GetBookingAuditRequest = Request & { validated: z.infer<typeof getBookingAuditSchema> };
type UploadBookingDocumentRequest = Request & { validated: z.infer<typeof uploadBookingDocumentSchema> };

export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ListBookingsRequest).validated;
    const result = await this.bookingsService.listBookings(req.user!.companyId, query);

    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: result,
    });
  });

  getFormOptions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const options = await this.bookingsService.getFormOptions(req.user!.companyId);

    res.status(200).json({
      success: true,
      message: "Booking form options retrieved successfully",
      data: options,
    });
  });

  getByUuid = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as GetBookingRequest).validated;
    const booking = await this.bookingsService.getBookingByUuid(req.user!.companyId, params.uuid);

    res.status(200).json({
      success: true,
      message: "Booking retrieved successfully",
      data: { booking },
    });
  });

  getAuditTrail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as GetBookingAuditRequest).validated;
    const auditTrail = await this.bookingsService.getAuditTrail(req.user!.companyId, params.uuid);

    res.status(200).json({
      success: true,
      message: "Booking audit trail retrieved successfully",
      data: { auditTrail },
    });
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { body } = (req as CreateBookingRequest).validated;
    const booking = await this.bookingsService.createBooking(req.user!.companyId, body, req.user!.id);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: { booking },
    });
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params, body } = (req as UpdateBookingRequest).validated;
    const booking = await this.bookingsService.updateBooking(req.user!.companyId, params.uuid, body, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: { booking },
    });
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as DeleteBookingRequest).validated;
    await this.bookingsService.deleteBooking(req.user!.companyId, params.uuid, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  });

  approve = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params, body } = (req as ApproveBookingRequest).validated;
    const booking = await this.bookingsService.approveBooking(req.user!.companyId, params.uuid, body, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Booking approved successfully",
      data: { booking },
    });
  });

  reject = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params, body } = (req as RejectBookingRequest).validated;
    const booking = await this.bookingsService.rejectBooking(req.user!.companyId, params.uuid, body, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Booking rejected successfully",
      data: { booking },
    });
  });

  cancel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params, body } = (req as CancelBookingRequest).validated;
    const booking = await this.bookingsService.cancelBooking(req.user!.companyId, params.uuid, body, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: { booking },
    });
  });

  uploadDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params, body } = (req as UploadBookingDocumentRequest).validated;
    const file = req.file;

    if (!file) {
      throw new AppError(400, "Document file is required");
    }

    const document = await this.bookingsService.uploadDocument(
      req.user!.companyId,
      params.uuid,
      body,
      file,
      req.user!.id,
    );

    res.status(201).json({
      success: true,
      message: "Booking document uploaded successfully",
      data: { document },
    });
  });
}
