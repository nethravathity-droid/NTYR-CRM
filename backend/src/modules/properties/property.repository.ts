import type { Knex } from "knex";
import type {
  CreateFloorData,
  CreateProjectData,
  CreateTowerData,
  CreateUnitData,
  FloorListItem,
  InventoryDashboard,
  PaginatedProjects,
  PaginatedUnits,
  ProjectDetail,
  ProjectListItem,
  ProjectRecord,
  TowerListItem,
  UnitDetail,
  UnitListItem,
  UnitRecord,
  UpdateProjectData,
  UpdateTowerData,
  UpdateUnitData,
} from "./property.types.js";
import type { ListProjectsQuery, ListUnitsQuery } from "./property.validation.js";

export class PropertyRepository {
  constructor(private readonly db: Knex) {}

  async listProjects(companyId: number, query: ListProjectsQuery): Promise<PaginatedProjects> {
    const baseQuery = this.db("projects as p")
      .where("p.company_id", companyId)
      .whereNull("p.deleted_at");

    if (query.search) {
      const term = `%${query.search}%`;
      baseQuery.where(function searchFilter() {
        this.whereILike("p.project_name", term)
          .orWhereILike("p.project_code", term)
          .orWhereILike("p.builder_name", term)
          .orWhereILike("p.city", term);
      });
    }

    if (query.status) {
      baseQuery.where("p.status", query.status);
    }

    if (query.city) {
      baseQuery.whereILike("p.city", `%${query.city}%`);
    }

    const countResult = await baseQuery.clone().countDistinct("p.id as total").first<{ total: string }>();
    const total = Number(countResult?.total ?? 0);
    const offset = (query.page - 1) * query.limit;

    const rows = await baseQuery
      .clone()
      .select("p.*")
      .orderBy(this.resolveProjectSortColumn(query.sortBy), query.sortOrder)
      .limit(query.limit)
      .offset(offset);

    const projects = await Promise.all(rows.map((row) => this.mapToProjectListItem(companyId, row as ProjectRecord)));

    return {
      projects,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 0,
      },
    };
  }

  async findProjectByUuid(companyId: number, uuid: string): Promise<ProjectDetail | null> {
    const row = await this.db<ProjectRecord>("projects")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .first();

    if (!row) {
      return null;
    }

    const listItem = await this.mapToProjectListItem(companyId, row);
    const towers = await this.listTowersByProjectId(companyId, row.id);

    return {
      ...listItem,
      address: row.address,
      description: row.description,
      amenities: Array.isArray(row.amenities) ? row.amenities : [],
      images: Array.isArray(row.images) ? row.images : [],
      brochurePdf: row.brochure_pdf,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      towers,
    };
  }

  async findProjectRecordByUuid(companyId: number, uuid: string): Promise<ProjectRecord | null> {
    const row = await this.db<ProjectRecord>("projects")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .first();

    return row ?? null;
  }

  async createProject(companyId: number, data: CreateProjectData, createdBy: number): Promise<ProjectDetail> {
    const [inserted] = await this.db("projects")
      .insert({
        company_id: companyId,
        project_name: data.projectName,
        project_code: data.projectCode,
        builder_name: data.builderName ?? null,
        rera_number: data.reraNumber ?? null,
        address: data.address ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        description: data.description ?? null,
        status: data.status ?? "UPCOMING",
        amenities: JSON.stringify(data.amenities ?? []),
        images: JSON.stringify(data.images ?? []),
        brochure_pdf: data.brochurePdf ?? null,
        created_by: createdBy,
        updated_by: createdBy,
      })
      .returning(["uuid"]);

    const project = await this.findProjectByUuid(companyId, inserted.uuid);
    if (!project) {
      throw new Error("Failed to retrieve created project");
    }

    return project;
  }

  async updateProject(companyId: number, projectId: number, data: UpdateProjectData, updatedBy: number): Promise<ProjectDetail | null> {
    const existing = await this.db<ProjectRecord>("projects")
      .where({ id: projectId, company_id: companyId })
      .whereNull("deleted_at")
      .first();

    if (!existing) {
      return null;
    }

    const payload: Record<string, unknown> = {
      updated_by: updatedBy,
      updated_at: this.db.fn.now(),
    };

    if (data.projectName !== undefined) payload.project_name = data.projectName;
    if (data.projectCode !== undefined) payload.project_code = data.projectCode;
    if (data.builderName !== undefined) payload.builder_name = data.builderName;
    if (data.reraNumber !== undefined) payload.rera_number = data.reraNumber;
    if (data.address !== undefined) payload.address = data.address;
    if (data.city !== undefined) payload.city = data.city;
    if (data.state !== undefined) payload.state = data.state;
    if (data.description !== undefined) payload.description = data.description;
    if (data.status !== undefined) payload.status = data.status;
    if (data.amenities !== undefined) payload.amenities = JSON.stringify(data.amenities);
    if (data.images !== undefined) payload.images = JSON.stringify(data.images);
    if (data.brochurePdf !== undefined) payload.brochure_pdf = data.brochurePdf;

    await this.db("projects").where({ id: projectId, company_id: companyId }).update(payload);
    return this.findProjectByUuid(companyId, existing.uuid);
  }

  async softDeleteProject(companyId: number, projectId: number, deletedBy: number): Promise<boolean> {
    const updated = await this.db("projects")
      .where({ id: projectId, company_id: companyId })
      .whereNull("deleted_at")
      .update({
        deleted_at: this.db.fn.now(),
        deleted_by: deletedBy,
        updated_at: this.db.fn.now(),
        updated_by: deletedBy,
      });

    return updated > 0;
  }

  async listTowersByProjectId(companyId: number, projectId: number): Promise<TowerListItem[]> {
    const rows = await this.db("towers as t")
      .where({ "t.company_id": companyId, "t.project_id": projectId })
      .whereNull("t.deleted_at")
      .orderBy("t.tower_name", "asc");

    return Promise.all(rows.map((row) => this.mapToTowerListItem(companyId, row)));
  }

  async createTower(companyId: number, projectId: number, data: CreateTowerData, createdBy: number): Promise<TowerListItem> {
    const [inserted] = await this.db("towers")
      .insert({
        company_id: companyId,
        project_id: projectId,
        tower_name: data.towerName,
        number_of_floors: data.numberOfFloors,
        created_by: createdBy,
        updated_by: createdBy,
      })
      .returning(["id"]);

    const row = await this.db("towers").where({ id: inserted.id }).first();
    return this.mapToTowerListItem(companyId, row);
  }

  async updateTower(companyId: number, towerUuid: string, data: UpdateTowerData, updatedBy: number): Promise<TowerListItem | null> {
    const existing = await this.db("towers")
      .where({ company_id: companyId, uuid: towerUuid })
      .whereNull("deleted_at")
      .first();

    if (!existing) {
      return null;
    }

    const payload: Record<string, unknown> = {
      updated_by: updatedBy,
      updated_at: this.db.fn.now(),
    };

    if (data.towerName !== undefined) payload.tower_name = data.towerName;
    if (data.numberOfFloors !== undefined) payload.number_of_floors = data.numberOfFloors;

    await this.db("towers").where({ id: existing.id }).update(payload);
    const row = await this.db("towers").where({ id: existing.id }).first();
    return this.mapToTowerListItem(companyId, row);
  }

  async softDeleteTower(companyId: number, towerUuid: string, deletedBy: number): Promise<boolean> {
    const updated = await this.db("towers")
      .where({ company_id: companyId, uuid: towerUuid })
      .whereNull("deleted_at")
      .update({
        deleted_at: this.db.fn.now(),
        deleted_by: deletedBy,
        updated_at: this.db.fn.now(),
        updated_by: deletedBy,
      });

    return updated > 0;
  }

  async listFloorsByTowerId(companyId: number, towerId: number): Promise<FloorListItem[]> {
    const rows = await this.db("floors as f")
      .join("towers as t", "t.id", "f.tower_id")
      .where({ "f.company_id": companyId, "f.tower_id": towerId })
      .whereNull("f.deleted_at")
      .select("f.*", "t.tower_name")
      .orderBy("f.floor_number", "asc");

    return Promise.all(rows.map((row) => this.mapToFloorListItem(companyId, row)));
  }

  async createFloor(companyId: number, projectId: number, towerId: number, data: CreateFloorData, createdBy: number): Promise<FloorListItem> {
    const [inserted] = await this.db("floors")
      .insert({
        company_id: companyId,
        project_id: projectId,
        tower_id: towerId,
        floor_number: data.floorNumber,
        created_by: createdBy,
        updated_by: createdBy,
      })
      .returning(["id"]);

    const row = await this.db("floors as f")
      .join("towers as t", "t.id", "f.tower_id")
      .where("f.id", inserted.id)
      .select("f.*", "t.tower_name")
      .first();

    return this.mapToFloorListItem(companyId, row);
  }

  async softDeleteFloor(companyId: number, floorUuid: string, deletedBy: number): Promise<boolean> {
    const updated = await this.db("floors")
      .where({ company_id: companyId, uuid: floorUuid })
      .whereNull("deleted_at")
      .update({
        deleted_at: this.db.fn.now(),
        deleted_by: deletedBy,
        updated_at: this.db.fn.now(),
        updated_by: deletedBy,
      });

    return updated > 0;
  }

  async listUnits(companyId: number, query: ListUnitsQuery): Promise<PaginatedUnits> {
    const baseQuery = this.db("units as u")
      .join("projects as p", "p.id", "u.project_id")
      .leftJoin("towers as t", "t.id", "u.tower_id")
      .leftJoin("floors as f", "f.id", "u.floor_id")
      .where("u.company_id", companyId)
      .whereNull("u.deleted_at")
      .whereNull("p.deleted_at");

    if (query.search) {
      const term = `%${query.search}%`;
      baseQuery.where(function searchFilter() {
        this.whereILike("u.unit_number", term)
          .orWhereILike("p.project_name", term)
          .orWhereILike("t.tower_name", term);
      });
    }

    if (query.projectId) baseQuery.where("u.project_id", query.projectId);
    if (query.towerId) baseQuery.where("u.tower_id", query.towerId);
    if (query.floorId) baseQuery.where("u.floor_id", query.floorId);
    if (query.availability) baseQuery.where("u.availability", query.availability);
    if (query.bhkType) baseQuery.whereILike("u.bhk_type", `%${query.bhkType}%`);

    const countResult = await baseQuery.clone().countDistinct("u.id as total").first<{ total: string }>();
    const total = Number(countResult?.total ?? 0);
    const offset = (query.page - 1) * query.limit;

    const rows = await baseQuery
      .clone()
      .select(
        "u.*",
        "p.uuid as project_uuid",
        "p.project_name",
        "t.tower_name",
        "f.floor_number",
      )
      .orderBy(this.resolveUnitSortColumn(query.sortBy), query.sortOrder)
      .limit(query.limit)
      .offset(offset);

    return {
      units: rows.map((row) => this.mapToUnitListItem(row)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 0,
      },
    };
  }

  async findUnitByUuid(companyId: number, uuid: string): Promise<UnitDetail | null> {
    const row = await this.db("units as u")
      .join("projects as p", "p.id", "u.project_id")
      .leftJoin("towers as t", "t.id", "u.tower_id")
      .leftJoin("floors as f", "f.id", "u.floor_id")
      .where({ "u.company_id": companyId, "u.uuid": uuid })
      .whereNull("u.deleted_at")
      .select(
        "u.*",
        "p.uuid as project_uuid",
        "p.project_name",
        "t.tower_name",
        "f.floor_number",
      )
      .first();

    return row ? { ...this.mapToUnitListItem(row), createdBy: row.created_by, updatedBy: row.updated_by } : null;
  }

  async createUnit(companyId: number, data: CreateUnitData, createdBy: number): Promise<UnitDetail> {
    const [inserted] = await this.db("units")
      .insert({
        company_id: companyId,
        project_id: data.projectId,
        tower_id: data.towerId ?? null,
        floor_id: data.floorId ?? null,
        unit_number: data.unitNumber,
        bhk_type: data.bhkType ?? null,
        super_built_up_area: data.superBuiltUpArea ?? null,
        carpet_area: data.carpetArea ?? null,
        facing: data.facing ?? null,
        price: data.price ?? null,
        plc_charges: data.plcCharges ?? null,
        availability: data.availability ?? "AVAILABLE",
        created_by: createdBy,
        updated_by: createdBy,
      })
      .returning(["uuid"]);

    const unit = await this.findUnitByUuid(companyId, inserted.uuid);
    if (!unit) {
      throw new Error("Failed to retrieve created unit");
    }

    return unit;
  }

  async updateUnit(companyId: number, unitId: number, data: UpdateUnitData, updatedBy: number): Promise<UnitDetail | null> {
    const existing = await this.db<UnitRecord>("units")
      .where({ id: unitId, company_id: companyId })
      .whereNull("deleted_at")
      .first();

    if (!existing) {
      return null;
    }

    const payload: Record<string, unknown> = {
      updated_by: updatedBy,
      updated_at: this.db.fn.now(),
    };

    if (data.projectId !== undefined) payload.project_id = data.projectId;
    if (data.towerId !== undefined) payload.tower_id = data.towerId;
    if (data.floorId !== undefined) payload.floor_id = data.floorId;
    if (data.unitNumber !== undefined) payload.unit_number = data.unitNumber;
    if (data.bhkType !== undefined) payload.bhk_type = data.bhkType;
    if (data.superBuiltUpArea !== undefined) payload.super_built_up_area = data.superBuiltUpArea;
    if (data.carpetArea !== undefined) payload.carpet_area = data.carpetArea;
    if (data.facing !== undefined) payload.facing = data.facing;
    if (data.price !== undefined) payload.price = data.price;
    if (data.plcCharges !== undefined) payload.plc_charges = data.plcCharges;
    if (data.availability !== undefined) payload.availability = data.availability;

    await this.db("units").where({ id: unitId }).update(payload);
    return this.findUnitByUuid(companyId, existing.uuid);
  }

  async softDeleteUnit(companyId: number, unitId: number, deletedBy: number): Promise<boolean> {
    const updated = await this.db("units")
      .where({ id: unitId, company_id: companyId })
      .whereNull("deleted_at")
      .update({
        deleted_at: this.db.fn.now(),
        deleted_by: deletedBy,
        updated_at: this.db.fn.now(),
        updated_by: deletedBy,
      });

    return updated > 0;
  }

  async getInventoryDashboard(companyId: number): Promise<InventoryDashboard> {
    const [projectStats, unitStats] = await Promise.all([
      this.db("projects")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .select(
          this.db.raw("COUNT(*) as total"),
          this.db.raw("SUM(CASE WHEN status = 'UPCOMING' THEN 1 ELSE 0 END) as upcoming"),
          this.db.raw("SUM(CASE WHEN status = 'ONGOING' THEN 1 ELSE 0 END) as ongoing"),
          this.db.raw("SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed"),
        )
        .first(),
      this.db("units")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .select(
          this.db.raw("COUNT(*) as total"),
          this.db.raw("SUM(CASE WHEN availability = 'AVAILABLE' THEN 1 ELSE 0 END) as available"),
          this.db.raw("SUM(CASE WHEN availability = 'HOLD' THEN 1 ELSE 0 END) as hold"),
          this.db.raw("SUM(CASE WHEN availability = 'BOOKED' THEN 1 ELSE 0 END) as booked"),
          this.db.raw("SUM(CASE WHEN availability = 'SOLD' THEN 1 ELSE 0 END) as sold"),
        )
        .first(),
    ]);

    return {
      totalProjects: Number(projectStats?.total ?? 0),
      upcomingProjects: Number(projectStats?.upcoming ?? 0),
      ongoingProjects: Number(projectStats?.ongoing ?? 0),
      completedProjects: Number(projectStats?.completed ?? 0),
      totalUnits: Number(unitStats?.total ?? 0),
      availableUnits: Number(unitStats?.available ?? 0),
      holdUnits: Number(unitStats?.hold ?? 0),
      bookedUnits: Number(unitStats?.booked ?? 0),
      soldUnits: Number(unitStats?.sold ?? 0),
    };
  }

  async getFormOptions(companyId: number) {
    const [projects, towers, floors] = await Promise.all([
      this.db("projects")
        .select("id", "uuid", "project_name as projectName", "project_code as projectCode")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .orderBy("project_name", "asc"),
      this.db("towers")
        .select("id", "uuid", "project_id as projectId", "tower_name as towerName")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .orderBy("tower_name", "asc"),
      this.db("floors as f")
        .join("towers as t", "t.id", "f.tower_id")
        .select("f.id", "f.uuid", "f.project_id as projectId", "f.tower_id as towerId", "f.floor_number as floorNumber", "t.tower_name as towerName")
        .where("f.company_id", companyId)
        .whereNull("f.deleted_at")
        .orderBy(["f.tower_id", "f.floor_number"]),
    ]);

    return {
      projects,
      towers,
      floors,
      bhkTypes: ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "Studio", "Penthouse"],
      facings: ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"],
      availabilities: ["AVAILABLE", "HOLD", "BOOKED", "SOLD"],
      projectStatuses: ["UPCOMING", "ONGOING", "COMPLETED"],
    };
  }

  private async mapToProjectListItem(companyId: number, row: ProjectRecord): Promise<ProjectListItem> {
    const [towerCount, unitStats] = await Promise.all([
      this.db("towers").where({ company_id: companyId, project_id: row.id }).whereNull("deleted_at").count<{ count: string }>("id as count").first(),
      this.db("units").where({ company_id: companyId, project_id: row.id }).whereNull("deleted_at").select(
        this.db.raw("COUNT(*) as total"),
        this.db.raw("SUM(CASE WHEN availability = 'AVAILABLE' THEN 1 ELSE 0 END) as available"),
      ).first(),
    ]);

    return {
      id: row.id,
      uuid: row.uuid,
      projectName: row.project_name,
      projectCode: row.project_code,
      builderName: row.builder_name,
      reraNumber: row.rera_number,
      city: row.city,
      state: row.state,
      status: row.status,
      towerCount: Number(towerCount?.count ?? 0),
      unitCount: Number(unitStats?.total ?? 0),
      availableUnits: Number(unitStats?.available ?? 0),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private async mapToTowerListItem(companyId: number, row: Record<string, unknown>): Promise<TowerListItem> {
    const towerId = row.id as number;
    const [floorCount, unitCount] = await Promise.all([
      this.db("floors").where({ company_id: companyId, tower_id: towerId }).whereNull("deleted_at").count<{ count: string }>("id as count").first(),
      this.db("units").where({ company_id: companyId, tower_id: towerId }).whereNull("deleted_at").count<{ count: string }>("id as count").first(),
    ]);

    return {
      id: towerId,
      uuid: row.uuid as string,
      towerName: row.tower_name as string,
      numberOfFloors: Number(row.number_of_floors),
      floorCount: Number(floorCount?.count ?? 0),
      unitCount: Number(unitCount?.count ?? 0),
    };
  }

  private async mapToFloorListItem(companyId: number, row: Record<string, unknown>): Promise<FloorListItem> {
    const floorId = row.id as number;
    const unitCount = await this.db("units")
      .where({ company_id: companyId, floor_id: floorId })
      .whereNull("deleted_at")
      .count<{ count: string }>("id as count")
      .first();

    return {
      id: floorId,
      uuid: row.uuid as string,
      floorNumber: Number(row.floor_number),
      towerId: row.tower_id as number,
      towerName: row.tower_name as string,
      unitCount: Number(unitCount?.count ?? 0),
    };
  }

  private mapToUnitListItem(row: Record<string, unknown>): UnitListItem {
    return {
      id: row.id as number,
      uuid: row.uuid as string,
      projectId: row.project_id as number,
      projectUuid: row.project_uuid as string,
      projectName: row.project_name as string,
      towerId: (row.tower_id as number | null) ?? null,
      towerName: (row.tower_name as string | null) ?? null,
      floorId: (row.floor_id as number | null) ?? null,
      floorNumber: row.floor_number != null ? Number(row.floor_number) : null,
      unitNumber: row.unit_number as string,
      bhkType: (row.bhk_type as string | null) ?? null,
      superBuiltUpArea: row.super_built_up_area != null ? Number(row.super_built_up_area) : null,
      carpetArea: row.carpet_area != null ? Number(row.carpet_area) : null,
      facing: (row.facing as string | null) ?? null,
      price: row.price != null ? Number(row.price) : null,
      plcCharges: row.plc_charges != null ? Number(row.plc_charges) : null,
      availability: row.availability as UnitListItem["availability"],
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private resolveProjectSortColumn(sortBy: ListProjectsQuery["sortBy"]): string {
    const columns: Record<ListProjectsQuery["sortBy"], string> = {
      project_name: "p.project_name",
      project_code: "p.project_code",
      created_at: "p.created_at",
      status: "p.status",
    };

    return columns[sortBy];
  }

  private resolveUnitSortColumn(sortBy: ListUnitsQuery["sortBy"]): string {
    const columns: Record<ListUnitsQuery["sortBy"], string> = {
      unit_number: "u.unit_number",
      price: "u.price",
      created_at: "u.created_at",
      availability: "u.availability",
    };

    return columns[sortBy];
  }
}
