import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import type { GrowthService } from "./growth.service.js";

export class GrowthController {
  constructor(private readonly growthService: GrowthService) {}

  hub = asyncHandler(async (req: Request, res: Response) => {
    const summary = await this.growthService.getHubSummary(req.user!.companyId);
    res.json({ success: true, data: summary });
  });

  listTemplates = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, channel } = req.query as { page?: string; limit?: string; channel?: string };
    const result = await this.growthService.listTemplates(
      req.user!.companyId,
      Number(page ?? 1),
      Number(limit ?? 20),
      channel,
    );
    res.json({ success: true, data: result });
  });

  createTemplate = asyncHandler(async (req: Request, res: Response) => {
    const template = await this.growthService.createTemplate(
      req.user!.companyId,
      req.user!.id,
      req.body,
    );
    res.status(201).json({ success: true, data: { template } });
  });

  updateTemplate = asyncHandler(async (req: Request, res: Response) => {
    const template = await this.growthService.updateTemplate(
      req.user!.companyId,
      String(req.params.uuid),
      req.user!.id,
      req.body,
    );
    res.json({ success: true, data: { template } });
  });

  deleteTemplate = asyncHandler(async (req: Request, res: Response) => {
    await this.growthService.deleteTemplate(req.user!.companyId, String(req.params.uuid));
    res.json({ success: true, message: "Template deleted" });
  });

  listCampaigns = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, status } = req.query as { page?: string; limit?: string; status?: string };
    const result = await this.growthService.listCampaigns(
      req.user!.companyId,
      Number(page ?? 1),
      Number(limit ?? 20),
      status,
    );
    res.json({ success: true, data: result });
  });

  createCampaign = asyncHandler(async (req: Request, res: Response) => {
    const campaign = await this.growthService.createCampaign(
      req.user!.companyId,
      req.user!.id,
      req.body,
    );
    res.status(201).json({ success: true, data: { campaign } });
  });

  updateCampaign = asyncHandler(async (req: Request, res: Response) => {
    const campaign = await this.growthService.updateCampaign(
      req.user!.companyId,
      String(req.params.uuid),
      req.body,
    );
    res.json({ success: true, data: { campaign } });
  });

  runCampaign = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.growthService.runCampaign(
      req.user!.companyId,
      String(req.params.uuid),
      req.user!.id,
    );
    res.json({ success: true, data: result });
  });

  listWorkflows = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, status } = req.query as { page?: string; limit?: string; status?: string };
    const result = await this.growthService.listWorkflows(
      req.user!.companyId,
      Number(page ?? 1),
      Number(limit ?? 20),
      status,
    );
    res.json({ success: true, data: result });
  });

  createWorkflow = asyncHandler(async (req: Request, res: Response) => {
    const workflow = await this.growthService.createWorkflow(
      req.user!.companyId,
      req.user!.id,
      req.body,
    );
    res.status(201).json({ success: true, data: { workflow } });
  });

  updateWorkflow = asyncHandler(async (req: Request, res: Response) => {
    const workflow = await this.growthService.updateWorkflow(
      req.user!.companyId,
      String(req.params.uuid),
      req.body,
    );
    res.json({ success: true, data: { workflow } });
  });

  listForms = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query as { page?: string; limit?: string };
    const result = await this.growthService.listForms(
      req.user!.companyId,
      Number(page ?? 1),
      Number(limit ?? 20),
    );
    res.json({ success: true, data: result });
  });

  createForm = asyncHandler(async (req: Request, res: Response) => {
    const form = await this.growthService.createForm(req.user!.companyId, req.user!.id, req.body);
    res.status(201).json({ success: true, data: { form } });
  });

  updateForm = asyncHandler(async (req: Request, res: Response) => {
    const form = await this.growthService.updateForm(req.user!.companyId, String(req.params.uuid), req.body);
    res.json({ success: true, data: { form } });
  });

  listFunnels = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query as { page?: string; limit?: string };
    const result = await this.growthService.listFunnels(
      req.user!.companyId,
      Number(page ?? 1),
      Number(limit ?? 20),
    );
    res.json({ success: true, data: result });
  });

  createFunnel = asyncHandler(async (req: Request, res: Response) => {
    const funnel = await this.growthService.createFunnel(req.user!.companyId, req.body);
    res.status(201).json({ success: true, data: { funnel } });
  });

  updateFunnel = asyncHandler(async (req: Request, res: Response) => {
    const funnel = await this.growthService.updateFunnel(req.user!.companyId, String(req.params.uuid), req.body);
    res.json({ success: true, data: { funnel } });
  });

  listAppointments = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, from, to } = req.query as {
      page?: string;
      limit?: string;
      from?: string;
      to?: string;
    };
    const result = await this.growthService.listAppointments(
      req.user!.companyId,
      Number(page ?? 1),
      Number(limit ?? 50),
      from,
      to,
    );
    res.json({ success: true, data: result });
  });

  createAppointment = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await this.growthService.createAppointment(
      req.user!.companyId,
      req.user!.id,
      req.body,
    );
    res.status(201).json({ success: true, data: { appointment } });
  });

  updateAppointment = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await this.growthService.updateAppointment(
      req.user!.companyId,
      String(req.params.uuid),
      req.body,
    );
    res.json({ success: true, data: { appointment } });
  });

  listReviews = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query as { page?: string; limit?: string };
    const result = await this.growthService.listReviews(
      req.user!.companyId,
      Number(page ?? 1),
      Number(limit ?? 20),
    );
    res.json({ success: true, data: result });
  });

  createReview = asyncHandler(async (req: Request, res: Response) => {
    const review = await this.growthService.createReview(req.user!.companyId, req.body);
    res.status(201).json({ success: true, data: { review } });
  });

  updateReview = asyncHandler(async (req: Request, res: Response) => {
    const review = await this.growthService.updateReview(req.user!.companyId, String(req.params.uuid), req.body);
    res.json({ success: true, data: { review } });
  });

  inbox = asyncHandler(async (req: Request, res: Response) => {
    const { limit, channel } = req.query as { limit?: string; channel?: string };
    const threads = await this.growthService.listInbox(
      req.user!.companyId,
      Number(limit ?? 50),
      channel,
    );
    res.json({ success: true, data: { threads } });
  });

  inboxThread = asyncHandler(async (req: Request, res: Response) => {
    const { channel, recipient, limit } = req.query as {
      channel: string;
      recipient: string;
      limit?: string;
    };
    const messages = await this.growthService.getInboxThread(
      req.user!.companyId,
      channel,
      recipient,
    );
    res.json({ success: true, data: { messages } });
  });

  inboxReply = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.growthService.replyInbox(req.user!.companyId, req.user!.id, req.body);
    res.status(201).json({ success: true, data: result });
  });

  getPublicForm = asyncHandler(async (req: Request, res: Response) => {
    const form = await this.growthService.getPublicForm(String(req.params.uuid));
    res.json({ success: true, data: { form } });
  });

  submitPublicForm = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.growthService.submitPublicForm(String(req.params.uuid), req.body);
    res.status(201).json({ success: true, data: result });
  });
}
