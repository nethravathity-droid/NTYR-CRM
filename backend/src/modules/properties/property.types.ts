export type ProjectStatus = "UPCOMING" | "ONGOING" | "COMPLETED";
export type UnitAvailability = "AVAILABLE" | "HOLD" | "BOOKED" | "SOLD";

export interface ProjectListItem {
  id: number;
  uuid: string;
  projectName: string;
  projectCode: string;
  builderName: string | null;
  reraNumber: string | null;
  city: string | null;
  state: string | null;
  status: ProjectStatus;
  towerCount: number;
  unitCount: number;
  availableUnits: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetail extends ProjectListItem {
  address: string | null;
  description: string | null;
  amenities: string[];
  images: string[];
  brochurePdf: string | null;
  createdBy: number | null;
  updatedBy: number | null;
  towers: TowerListItem[];
}

export interface TowerListItem {
  id: number;
  uuid: string;
  towerName: string;
  numberOfFloors: number;
  floorCount: number;
  unitCount: number;
}

export interface FloorListItem {
  id: number;
  uuid: string;
  floorNumber: number;
  towerId: number;
  towerName: string;
  unitCount: number;
}

export interface UnitListItem {
  id: number;
  uuid: string;
  projectId: number;
  projectUuid: string;
  projectName: string;
  towerId: number | null;
  towerName: string | null;
  floorId: number | null;
  floorNumber: number | null;
  unitNumber: string;
  bhkType: string | null;
  superBuiltUpArea: number | null;
  carpetArea: number | null;
  facing: string | null;
  price: number | null;
  plcCharges: number | null;
  availability: UnitAvailability;
  createdAt: string;
  updatedAt: string;
}

export interface UnitDetail extends UnitListItem {
  createdBy: number | null;
  updatedBy: number | null;
}

export interface PaginatedProjects {
  projects: ProjectListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedUnits {
  units: UnitListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface InventoryDashboard {
  totalProjects: number;
  totalUnits: number;
  availableUnits: number;
  holdUnits: number;
  bookedUnits: number;
  soldUnits: number;
  upcomingProjects: number;
  ongoingProjects: number;
  completedProjects: number;
}

export interface CreateProjectData {
  projectName: string;
  projectCode: string;
  builderName?: string | null;
  reraNumber?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  description?: string | null;
  status?: ProjectStatus;
  amenities?: string[];
  images?: string[];
  brochurePdf?: string | null;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {}

export interface CreateTowerData {
  towerName: string;
  numberOfFloors: number;
}

export interface UpdateTowerData extends Partial<CreateTowerData> {}

export interface CreateFloorData {
  floorNumber: number;
}

export interface CreateUnitData {
  projectId: number;
  towerId?: number | null;
  floorId?: number | null;
  unitNumber: string;
  bhkType?: string | null;
  superBuiltUpArea?: number | null;
  carpetArea?: number | null;
  facing?: string | null;
  price?: number | null;
  plcCharges?: number | null;
  availability?: UnitAvailability;
}

export interface UpdateUnitData extends Partial<CreateUnitData> {}

export interface ProjectRecord {
  id: number;
  uuid: string;
  company_id: number;
  project_name: string;
  project_code: string;
  builder_name: string | null;
  rera_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  description: string | null;
  status: ProjectStatus;
  amenities: string[] | null;
  images: string[] | null;
  brochure_pdf: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
}

export interface UnitRecord {
  id: number;
  uuid: string;
  company_id: number;
  project_id: number;
  tower_id: number | null;
  floor_id: number | null;
  unit_number: string;
  bhk_type: string | null;
  super_built_up_area: string | null;
  carpet_area: string | null;
  facing: string | null;
  price: string | null;
  plc_charges: string | null;
  availability: UnitAvailability;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
}
