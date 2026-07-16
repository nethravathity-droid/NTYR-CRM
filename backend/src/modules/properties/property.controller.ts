import type { Request, Response } from "express";
import type { z } from "zod";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import type { PropertyService } from "./property.service.js";
import type {
  createFloorSchema,
  createTowerSchema,
  createUnitSchema,
  deleteFloorSchema,
  deleteProjectSchema,
  deleteTowerSchema,
  deleteUnitSchema,
  getProjectSchema,
  getUnitSchema,
  listProjectsSchema,
  listUnitsSchema,
  updateTowerSchema,
  updateUnitSchema,
} from "./property.validation.js";
import { createProjectSchema, updateProjectSchema } from "./property.validation.js";

type ListProjectsRequest = Request & { validated: z.infer<typeof listProjectsSchema> };
type GetProjectRequest = Request & { validated: z.infer<typeof getProjectSchema> };
type DeleteProjectRequest = Request & { validated: z.infer<typeof deleteProjectSchema> };
type ListUnitsRequest = Request & { validated: z.infer<typeof listUnitsSchema> };
type GetUnitRequest = Request & { validated: z.infer<typeof getUnitSchema> };
type CreateUnitRequest = Request & { validated: z.infer<typeof createUnitSchema> };
type UpdateUnitRequest = Request & { validated: z.infer<typeof updateUnitSchema> };
type DeleteUnitRequest = Request & { validated: z.infer<typeof deleteUnitSchema> };
type CreateTowerRequest = Request & { validated: z.infer<typeof createTowerSchema> };
type UpdateTowerRequest = Request & { validated: z.infer<typeof updateTowerSchema> };
type DeleteTowerRequest = Request & { validated: z.infer<typeof deleteTowerSchema> };
type CreateFloorRequest = Request & { validated: z.infer<typeof createFloorSchema> };
type DeleteFloorRequest = Request & { validated: z.infer<typeof deleteFloorSchema> };

export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  listProjects = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ListProjectsRequest).validated;
    const result = await this.propertyService.listProjects(req.user!.companyId, query);

    res.status(200).json({
      success: true,
      message: "Projects retrieved successfully",
      data: result,
    });
  });

  getInventoryDashboard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dashboard = await this.propertyService.getInventoryDashboard(req.user!.companyId);

    res.status(200).json({
      success: true,
      message: "Inventory dashboard retrieved successfully",
      data: dashboard,
    });
  });

  getFormOptions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const options = await this.propertyService.getFormOptions(req.user!.companyId);

    res.status(200).json({
      success: true,
      message: "Property form options retrieved successfully",
      data: options,
    });
  });

  getProjectByUuid = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as GetProjectRequest).validated;
    const project = await this.propertyService.getProjectByUuid(req.user!.companyId, params.uuid);

    res.status(200).json({
      success: true,
      message: "Project retrieved successfully",
      data: { project },
    });
  });

  createProject = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const body = this.propertyService.parseProjectBody(req.body as Record<string, unknown>);
    const parsed = createProjectSchema.shape.body.parse(body);
    const files = req.files as { images?: Express.Multer.File[]; brochure?: Express.Multer.File[] } | undefined;

    const project = await this.propertyService.createProject(
      req.user!.companyId,
      parsed,
      req.user!.id,
      files,
    );

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: { project },
    });
  });

  updateProject = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as GetProjectRequest).validated;
    const body = this.propertyService.parseProjectBody(req.body as Record<string, unknown>);
    const parsed = updateProjectSchema.shape.body.parse(body);
    const files = req.files as { images?: Express.Multer.File[]; brochure?: Express.Multer.File[] } | undefined;

    const project = await this.propertyService.updateProject(
      req.user!.companyId,
      params.uuid,
      parsed,
      req.user!.id,
      files,
    );

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: { project },
    });
  });

  deleteProject = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as DeleteProjectRequest).validated;
    await this.propertyService.deleteProject(req.user!.companyId, params.uuid, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  });

  createTower = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params, body } = (req as CreateTowerRequest).validated;
    const tower = await this.propertyService.createTower(req.user!.companyId, params.uuid, body, req.user!.id);

    res.status(201).json({
      success: true,
      message: "Tower created successfully",
      data: { tower },
    });
  });

  updateTower = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params, body } = (req as UpdateTowerRequest).validated;
    const tower = await this.propertyService.updateTower(req.user!.companyId, params.uuid, body, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Tower updated successfully",
      data: { tower },
    });
  });

  deleteTower = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as DeleteTowerRequest).validated;
    await this.propertyService.deleteTower(req.user!.companyId, params.uuid, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Tower deleted successfully",
    });
  });

  listFloors = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as CreateTowerRequest).validated;
    const floors = await this.propertyService.listFloors(req.user!.companyId, params.uuid);

    res.status(200).json({
      success: true,
      message: "Floors retrieved successfully",
      data: floors,
    });
  });

  createFloor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params, body } = (req as CreateFloorRequest).validated;
    const floor = await this.propertyService.createFloor(req.user!.companyId, params.uuid, body, req.user!.id);

    res.status(201).json({
      success: true,
      message: "Floor created successfully",
      data: { floor },
    });
  });

  deleteFloor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as DeleteFloorRequest).validated;
    await this.propertyService.deleteFloor(req.user!.companyId, params.uuid, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Floor deleted successfully",
    });
  });

  listUnits = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { query } = (req as ListUnitsRequest).validated;
    const result = await this.propertyService.listUnits(req.user!.companyId, query);

    res.status(200).json({
      success: true,
      message: "Units retrieved successfully",
      data: result,
    });
  });

  getUnitByUuid = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as GetUnitRequest).validated;
    const unit = await this.propertyService.getUnitByUuid(req.user!.companyId, params.uuid);

    res.status(200).json({
      success: true,
      message: "Unit retrieved successfully",
      data: { unit },
    });
  });

  createUnit = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { body } = (req as CreateUnitRequest).validated;
    const unit = await this.propertyService.createUnit(req.user!.companyId, body, req.user!.id);

    res.status(201).json({
      success: true,
      message: "Unit created successfully",
      data: { unit },
    });
  });

  updateUnit = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params, body } = (req as UpdateUnitRequest).validated;
    const unit = await this.propertyService.updateUnit(req.user!.companyId, params.uuid, body, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Unit updated successfully",
      data: { unit },
    });
  });

  deleteUnit = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { params } = (req as DeleteUnitRequest).validated;
    await this.propertyService.deleteUnit(req.user!.companyId, params.uuid, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Unit deleted successfully",
    });
  });
}
