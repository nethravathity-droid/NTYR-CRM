import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  FloorListItem,
  InventoryDashboard,
  ListProjectsParams,
  ListUnitsParams,
  PaginatedProjects,
  PaginatedUnits,
  ProjectDetail,
  ProjectFormValues,
  PropertyFormOptions,
  TowerListItem,
  UnitFormValues,
  UnitListItem,
} from "@/features/properties/types/property.types";

function buildProjectFormData(values: ProjectFormValues, images: File[], brochure: File | null) {
  const formData = new FormData();
  formData.append("projectName", values.projectName);
  formData.append("projectCode", values.projectCode);
  formData.append("builderName", values.builderName);
  formData.append("reraNumber", values.reraNumber);
  formData.append("address", values.address);
  formData.append("city", values.city);
  formData.append("state", values.state);
  formData.append("description", values.description);
  formData.append("status", values.status);
  formData.append("amenities", JSON.stringify(values.amenities.split(",").map((item) => item.trim()).filter(Boolean)));
  images.forEach((file) => formData.append("images", file));
  if (brochure) {
    formData.append("brochure", brochure);
  }
  return formData;
}

function normalizeUnitPayload(values: UnitFormValues) {
  return {
    projectId: values.projectId,
    towerId: values.towerId,
    floorId: values.floorId,
    unitNumber: values.unitNumber,
    bhkType: values.bhkType || null,
    superBuiltUpArea: values.superBuiltUpArea ? Number(values.superBuiltUpArea) : null,
    carpetArea: values.carpetArea ? Number(values.carpetArea) : null,
    facing: values.facing || null,
    price: values.price ? Number(values.price) : null,
    plcCharges: values.plcCharges ? Number(values.plcCharges) : null,
    availability: values.availability,
  };
}

export const propertiesService = {
  async listProjects(params: ListProjectsParams = {}): Promise<PaginatedProjects> {
    const response = await apiClient.get<ApiResponse<PaginatedProjects>>("/projects", { params });
    return response.data.data;
  },

  async getInventoryDashboard(): Promise<InventoryDashboard> {
    const response = await apiClient.get<ApiResponse<InventoryDashboard>>("/projects/inventory/dashboard");
    return response.data.data;
  },

  async getFormOptions(): Promise<PropertyFormOptions> {
    const response = await apiClient.get<ApiResponse<PropertyFormOptions>>("/projects/form-options");
    return response.data.data;
  },

  async getProject(uuid: string): Promise<ProjectDetail> {
    const response = await apiClient.get<ApiResponse<{ project: ProjectDetail }>>(`/projects/${uuid}`);
    return response.data.data.project;
  },

  async createProject(values: ProjectFormValues, images: File[] = [], brochure: File | null = null): Promise<ProjectDetail> {
    const response = await apiClient.post<ApiResponse<{ project: ProjectDetail }>>(
      "/projects",
      buildProjectFormData(values, images, brochure),
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.data.project;
  },

  async updateProject(uuid: string, values: ProjectFormValues, images: File[] = [], brochure: File | null = null): Promise<ProjectDetail> {
    const response = await apiClient.put<ApiResponse<{ project: ProjectDetail }>>(
      `/projects/${uuid}`,
      buildProjectFormData(values, images, brochure),
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.data.project;
  },

  async deleteProject(uuid: string): Promise<void> {
    await apiClient.delete(`/projects/${uuid}`);
  },

  async createTower(projectUuid: string, payload: { towerName: string; numberOfFloors: number }): Promise<TowerListItem> {
    const response = await apiClient.post<ApiResponse<{ tower: TowerListItem }>>(`/projects/${projectUuid}/towers`, payload);
    return response.data.data.tower;
  },

  async updateTower(towerUuid: string, payload: { towerName?: string; numberOfFloors?: number }): Promise<TowerListItem> {
    const response = await apiClient.put<ApiResponse<{ tower: TowerListItem }>>(`/projects/towers/${towerUuid}`, payload);
    return response.data.data.tower;
  },

  async deleteTower(towerUuid: string): Promise<void> {
    await apiClient.delete(`/projects/towers/${towerUuid}`);
  },

  async listFloors(towerUuid: string): Promise<FloorListItem[]> {
    const response = await apiClient.get<ApiResponse<FloorListItem[]>>(`/projects/towers/${towerUuid}/floors`);
    return response.data.data;
  },

  async createFloor(towerUuid: string, payload: { floorNumber: number }): Promise<FloorListItem> {
    const response = await apiClient.post<ApiResponse<{ floor: FloorListItem }>>(`/projects/towers/${towerUuid}/floors`, payload);
    return response.data.data.floor;
  },

  async deleteFloor(floorUuid: string): Promise<void> {
    await apiClient.delete(`/projects/floors/${floorUuid}`);
  },

  async listUnits(params: ListUnitsParams = {}): Promise<PaginatedUnits> {
    const response = await apiClient.get<ApiResponse<PaginatedUnits>>("/units", { params });
    return response.data.data;
  },

  async createUnit(values: UnitFormValues): Promise<UnitListItem> {
    const response = await apiClient.post<ApiResponse<{ unit: UnitListItem }>>("/units", normalizeUnitPayload(values));
    return response.data.data.unit;
  },

  async updateUnit(uuid: string, values: UnitFormValues): Promise<UnitListItem> {
    const response = await apiClient.put<ApiResponse<{ unit: UnitListItem }>>(`/units/${uuid}`, normalizeUnitPayload(values));
    return response.data.data.unit;
  },

  async deleteUnit(uuid: string): Promise<void> {
    await apiClient.delete(`/units/${uuid}`);
  },
};
