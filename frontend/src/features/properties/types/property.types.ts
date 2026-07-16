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

export interface PaginatedProjects {
  projects: ProjectListItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface PaginatedUnits {
  units: UnitListItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
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

export interface PropertyFormOptions {
  projects: Array<{ id: number; uuid: string; projectName: string; projectCode: string }>;
  towers: Array<{ id: number; uuid: string; projectId: number; towerName: string }>;
  floors: Array<{ id: number; uuid: string; projectId: number; towerId: number; floorNumber: number; towerName: string }>;
  bhkTypes: string[];
  facings: string[];
  availabilities: UnitAvailability[];
  projectStatuses: ProjectStatus[];
}

export interface ProjectFormValues {
  projectName: string;
  projectCode: string;
  builderName: string;
  reraNumber: string;
  address: string;
  city: string;
  state: string;
  description: string;
  status: ProjectStatus;
  amenities: string;
}

export interface UnitFormValues {
  projectId: number;
  towerId: number | null;
  floorId: number | null;
  unitNumber: string;
  bhkType: string;
  superBuiltUpArea: string;
  carpetArea: string;
  facing: string;
  price: string;
  plcCharges: string;
  availability: UnitAvailability;
}

export interface ListProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  city?: string;
  sortBy?: "project_name" | "project_code" | "created_at" | "status";
  sortOrder?: "asc" | "desc";
}

export interface ListUnitsParams {
  page?: number;
  limit?: number;
  search?: string;
  projectId?: number;
  towerId?: number;
  floorId?: number;
  availability?: UnitAvailability;
  bhkType?: string;
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  UPCOMING: "Upcoming",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
};

export const UNIT_AVAILABILITY_LABELS: Record<UnitAvailability, string> = {
  AVAILABLE: "Available",
  HOLD: "Hold",
  BOOKED: "Booked",
  SOLD: "Sold",
};

export function assetUrl(path: string): string {
  const base = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1\/?$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
