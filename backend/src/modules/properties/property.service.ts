import winston, { type Logger } from "winston";
import { AppError } from "../../common/errors/AppError.js";
import { parseJsonArrayField, saveUploadedFile, toPublicUploadPath } from "../../common/utils/uploads.js";
import { db } from "../../database/knex.js";
import { PropertyRepository } from "./property.repository.js";
import type {
  CreateProjectInput,
  CreateUnitInput,
  ListProjectsQuery,
  ListUnitsQuery,
  UpdateProjectInput,
  UpdateUnitInput,
} from "./property.validation.js";
import type { CreateFloorData, CreateTowerData, InventoryDashboard, ProjectDetail, TowerListItem, UnitDetail } from "./property.types.js";

export class PropertyService {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly logger: Logger,
  ) {}

  async listProjects(companyId: number, query: ListProjectsQuery) {
    return this.propertyRepository.listProjects(companyId, query);
  }

  async getProjectByUuid(companyId: number, uuid: string): Promise<ProjectDetail> {
    const project = await this.propertyRepository.findProjectByUuid(companyId, uuid);
    if (!project) {
      throw new AppError(404, "Project not found");
    }

    return this.withPublicAssetUrls(project);
  }

  async createProject(
    companyId: number,
    input: CreateProjectInput,
    createdBy: number,
    files?: { images?: Express.Multer.File[]; brochure?: Express.Multer.File[] },
  ): Promise<ProjectDetail> {
    await this.ensureUniqueProjectCode(companyId, input.projectCode);

    const project = await this.propertyRepository.createProject(companyId, {
      ...input,
      amenities: input.amenities ?? [],
      images: [],
      brochurePdf: null,
    }, createdBy);

    const assets = await this.persistProjectAssets(companyId, project.uuid, project.images, project.brochurePdf, files);
    if (assets.images.length || assets.brochurePdf !== project.brochurePdf) {
      const updated = await this.propertyRepository.updateProject(companyId, project.id, assets, createdBy);
      return this.withPublicAssetUrls(updated!);
    }

    this.logger.info("Project created", { companyId, projectUuid: project.uuid });
    return this.withPublicAssetUrls(project);
  }

  async updateProject(
    companyId: number,
    uuid: string,
    input: UpdateProjectInput,
    updatedBy: number,
    files?: { images?: Express.Multer.File[]; brochure?: Express.Multer.File[] },
  ): Promise<ProjectDetail> {
    const existing = await this.propertyRepository.findProjectRecordByUuid(companyId, uuid);
    if (!existing) {
      throw new AppError(404, "Project not found");
    }

    if (input.projectCode && input.projectCode !== existing.project_code) {
      await this.ensureUniqueProjectCode(companyId, input.projectCode, existing.id);
    }

    const current = await this.propertyRepository.findProjectByUuid(companyId, uuid);
    const assets = await this.persistProjectAssets(
      companyId,
      uuid,
      current?.images ?? [],
      current?.brochurePdf ?? null,
      files,
    );

    const project = await this.propertyRepository.updateProject(companyId, existing.id, {
      ...input,
      ...(files?.images?.length ? { images: assets.images } : {}),
      ...(files?.brochure?.length ? { brochurePdf: assets.brochurePdf } : {}),
    }, updatedBy);

    if (!project) {
      throw new AppError(404, "Project not found");
    }

    return this.withPublicAssetUrls(project);
  }

  async deleteProject(companyId: number, uuid: string, deletedBy: number): Promise<void> {
    const existing = await this.propertyRepository.findProjectRecordByUuid(companyId, uuid);
    if (!existing) {
      throw new AppError(404, "Project not found");
    }

    const deleted = await this.propertyRepository.softDeleteProject(companyId, existing.id, deletedBy);
    if (!deleted) {
      throw new AppError(404, "Project not found");
    }
  }

  async createTower(companyId: number, projectUuid: string, input: CreateTowerData, createdBy: number): Promise<TowerListItem> {
    const project = await this.propertyRepository.findProjectRecordByUuid(companyId, projectUuid);
    if (!project) {
      throw new AppError(404, "Project not found");
    }

    return this.propertyRepository.createTower(companyId, project.id, input, createdBy);
  }

  async updateTower(companyId: number, towerUuid: string, input: Partial<CreateTowerData>, updatedBy: number): Promise<TowerListItem> {
    const tower = await this.propertyRepository.updateTower(companyId, towerUuid, input, updatedBy);
    if (!tower) {
      throw new AppError(404, "Tower not found");
    }

    return tower;
  }

  async deleteTower(companyId: number, towerUuid: string, deletedBy: number): Promise<void> {
    const deleted = await this.propertyRepository.softDeleteTower(companyId, towerUuid, deletedBy);
    if (!deleted) {
      throw new AppError(404, "Tower not found");
    }
  }

  async listFloors(companyId: number, towerUuid: string) {
    const tower = await db("towers").where({ company_id: companyId, uuid: towerUuid }).whereNull("deleted_at").first<{ id: number }>();
    if (!tower) {
      throw new AppError(404, "Tower not found");
    }

    return this.propertyRepository.listFloorsByTowerId(companyId, tower.id);
  }

  async createFloor(companyId: number, towerUuid: string, input: CreateFloorData, createdBy: number) {
    const tower = await db("towers").where({ company_id: companyId, uuid: towerUuid }).whereNull("deleted_at").first<{ id: number; project_id: number }>();
    if (!tower) {
      throw new AppError(404, "Tower not found");
    }

    return this.propertyRepository.createFloor(companyId, tower.project_id, tower.id, input, createdBy);
  }

  async deleteFloor(companyId: number, floorUuid: string, deletedBy: number): Promise<void> {
    const deleted = await this.propertyRepository.softDeleteFloor(companyId, floorUuid, deletedBy);
    if (!deleted) {
      throw new AppError(404, "Floor not found");
    }
  }

  async listUnits(companyId: number, query: ListUnitsQuery) {
    return this.propertyRepository.listUnits(companyId, query);
  }

  async getUnitByUuid(companyId: number, uuid: string): Promise<UnitDetail> {
    const unit = await this.propertyRepository.findUnitByUuid(companyId, uuid);
    if (!unit) {
      throw new AppError(404, "Unit not found");
    }

    return unit;
  }

  async createUnit(companyId: number, input: CreateUnitInput, createdBy: number): Promise<UnitDetail> {
    await this.validateUnitRelations(companyId, input.projectId, input.towerId, input.floorId);
    return this.propertyRepository.createUnit(companyId, input, createdBy);
  }

  async updateUnit(companyId: number, uuid: string, input: UpdateUnitInput, updatedBy: number): Promise<UnitDetail> {
    const existing = await db("units").where({ company_id: companyId, uuid }).whereNull("deleted_at").first<{ id: number; project_id: number }>();
    if (!existing) {
      throw new AppError(404, "Unit not found");
    }

    const projectId = input.projectId ?? existing.project_id;
    await this.validateUnitRelations(companyId, projectId, input.towerId, input.floorId);

    const unit = await this.propertyRepository.updateUnit(companyId, existing.id, input, updatedBy);
    if (!unit) {
      throw new AppError(404, "Unit not found");
    }

    return unit;
  }

  async deleteUnit(companyId: number, uuid: string, deletedBy: number): Promise<void> {
    const existing = await db("units").where({ company_id: companyId, uuid }).whereNull("deleted_at").first<{ id: number }>();
    if (!existing) {
      throw new AppError(404, "Unit not found");
    }

    const deleted = await this.propertyRepository.softDeleteUnit(companyId, existing.id, deletedBy);
    if (!deleted) {
      throw new AppError(404, "Unit not found");
    }
  }

  async getInventoryDashboard(companyId: number): Promise<InventoryDashboard> {
    return this.propertyRepository.getInventoryDashboard(companyId);
  }

  async getFormOptions(companyId: number) {
    return this.propertyRepository.getFormOptions(companyId);
  }

  parseProjectBody(body: Record<string, unknown>): CreateProjectInput {
    return {
      projectName: String(body.projectName ?? ""),
      projectCode: String(body.projectCode ?? ""),
      builderName: body.builderName ? String(body.builderName) : null,
      reraNumber: body.reraNumber ? String(body.reraNumber) : null,
      address: body.address ? String(body.address) : null,
      city: body.city ? String(body.city) : null,
      state: body.state ? String(body.state) : null,
      description: body.description ? String(body.description) : null,
      status: (body.status as CreateProjectInput["status"]) ?? "UPCOMING",
      amenities: parseJsonArrayField(body.amenities),
    };
  }

  private async ensureUniqueProjectCode(companyId: number, projectCode: string, excludeId?: number) {
    const query = db("projects")
      .where({ company_id: companyId, project_code: projectCode })
      .whereNull("deleted_at");

    if (excludeId) {
      query.whereNot("id", excludeId);
    }

    const existing = await query.first();
    if (existing) {
      throw new AppError(409, "Project code already exists");
    }
  }

  private async validateUnitRelations(
    companyId: number,
    projectId: number,
    towerId?: number | null,
    floorId?: number | null,
  ) {
    const project = await db("projects").where({ id: projectId, company_id: companyId }).whereNull("deleted_at").first();
    if (!project) {
      throw new AppError(400, "Invalid project");
    }

    if (towerId) {
      const tower = await db("towers").where({ id: towerId, company_id: companyId, project_id: projectId }).whereNull("deleted_at").first();
      if (!tower) {
        throw new AppError(400, "Invalid tower for project");
      }
    }

    if (floorId) {
      const floor = await db("floors").where({ id: floorId, company_id: companyId, project_id: projectId }).whereNull("deleted_at").first();
      if (!floor) {
        throw new AppError(400, "Invalid floor for project");
      }
    }
  }

  private async persistProjectAssets(
    companyId: number,
    projectUuid: string,
    existingImages: string[],
    existingBrochure: string | null,
    files?: { images?: Express.Multer.File[]; brochure?: Express.Multer.File[] },
  ) {
    const images = [...existingImages];
    let brochurePdf = existingBrochure;

    if (files?.images?.length) {
      for (const file of files.images) {
        const saved = await saveUploadedFile(file, ["companies", String(companyId), "projects", projectUuid, "images"]);
        images.push(saved);
      }
    }

    if (files?.brochure?.length && files.brochure[0]) {
      const saved = await saveUploadedFile(files.brochure[0], ["companies", String(companyId), "projects", projectUuid, "brochure"]);
      brochurePdf = saved;
    }

    return { images, brochurePdf };
  }

  private withPublicAssetUrls(project: ProjectDetail): ProjectDetail {
    return {
      ...project,
      images: project.images.map((image) => (image.startsWith("/uploads/") ? image : toPublicUploadPath(image))),
      brochurePdf: project.brochurePdf
        ? project.brochurePdf.startsWith("/uploads/")
          ? project.brochurePdf
          : toPublicUploadPath(project.brochurePdf)
        : null,
    };
  }
}

const logger = winston.createLogger({
  level: "info",
  transports: [new winston.transports.Console()],
});

export const propertyService = new PropertyService(new PropertyRepository(db), logger);
