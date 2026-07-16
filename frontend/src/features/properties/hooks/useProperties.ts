import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { propertiesService } from "@/features/properties/services/properties.service";
import type { ListProjectsParams, ListUnitsParams, ProjectFormValues, UnitFormValues } from "@/features/properties/types/property.types";

export const propertyKeys = {
  all: ["properties"] as const,
  projects: () => [...propertyKeys.all, "projects"] as const,
  projectList: (params: ListProjectsParams) => [...propertyKeys.projects(), "list", params] as const,
  projectDetail: (uuid: string) => [...propertyKeys.projects(), uuid] as const,
  dashboard: () => [...propertyKeys.all, "dashboard"] as const,
  formOptions: () => [...propertyKeys.all, "form-options"] as const,
  units: () => [...propertyKeys.all, "units"] as const,
  unitList: (params: ListUnitsParams) => [...propertyKeys.units(), "list", params] as const,
  floors: (towerUuid: string) => [...propertyKeys.all, "floors", towerUuid] as const,
};

export function useProjects(params: ListProjectsParams) {
  return useQuery({
    queryKey: propertyKeys.projectList(params),
    queryFn: () => propertiesService.listProjects(params),
    placeholderData: keepPreviousData,
  });
}

export function useProject(uuid: string) {
  return useQuery({
    queryKey: propertyKeys.projectDetail(uuid),
    queryFn: () => propertiesService.getProject(uuid),
    enabled: Boolean(uuid),
  });
}

export function useInventoryDashboard() {
  return useQuery({
    queryKey: propertyKeys.dashboard(),
    queryFn: () => propertiesService.getInventoryDashboard(),
  });
}

export function usePropertyFormOptions() {
  return useQuery({
    queryKey: propertyKeys.formOptions(),
    queryFn: () => propertiesService.getFormOptions(),
  });
}

export function useUnits(params: ListUnitsParams) {
  return useQuery({
    queryKey: propertyKeys.unitList(params),
    queryFn: () => propertiesService.listUnits(params),
    placeholderData: keepPreviousData,
  });
}

export function useFloors(towerUuid: string) {
  return useQuery({
    queryKey: propertyKeys.floors(towerUuid),
    queryFn: () => propertiesService.listFloors(towerUuid),
    enabled: Boolean(towerUuid),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ values, images, brochure }: { values: ProjectFormValues; images?: File[]; brochure?: File | null }) =>
      propertiesService.createProject(values, images ?? [], brochure ?? null),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: propertyKeys.all }),
  });
}

export function useUpdateProject(uuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ values, images, brochure }: { values: ProjectFormValues; images?: File[]; brochure?: File | null }) =>
      propertiesService.updateProject(uuid, values, images ?? [], brochure ?? null),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: propertyKeys.all }),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => propertiesService.deleteProject(uuid),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: propertyKeys.all }),
  });
}

export function useCreateTower(projectUuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { towerName: string; numberOfFloors: number }) => propertiesService.createTower(projectUuid, payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: propertyKeys.all }),
  });
}

export function useCreateFloor(towerUuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { floorNumber: number }) => propertiesService.createFloor(towerUuid, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.all });
      void queryClient.invalidateQueries({ queryKey: propertyKeys.floors(towerUuid) });
    },
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: UnitFormValues) => propertiesService.createUnit(values),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: propertyKeys.all }),
  });
}

export function useUpdateUnit(uuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: UnitFormValues) => propertiesService.updateUnit(uuid, values),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: propertyKeys.all }),
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => propertiesService.deleteUnit(uuid),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: propertyKeys.all }),
  });
}
