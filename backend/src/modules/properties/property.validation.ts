import { z } from "zod";

const projectStatusSchema = z.enum(["UPCOMING", "ONGOING", "COMPLETED"]);
const unitAvailabilitySchema = z.enum(["AVAILABLE", "HOLD", "BOOKED", "SOLD"]);

const uuidParamSchema = z.object({
  params: z.object({
    uuid: z.string().uuid("Invalid UUID"),
  }),
});

const projectBodySchema = z.object({
  projectName: z.string().trim().min(1).max(200),
  projectCode: z.string().trim().min(1).max(50),
  builderName: z.string().trim().max(200).nullable().optional(),
  reraNumber: z.string().trim().max(100).nullable().optional(),
  address: z.string().trim().max(1000).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  state: z.string().trim().max(100).nullable().optional(),
  description: z.string().trim().max(4000).nullable().optional(),
  status: projectStatusSchema.default("UPCOMING"),
  amenities: z.array(z.string().trim().max(100)).default([]),
});

const unitBodySchema = z.object({
  projectId: z.number().int().positive(),
  towerId: z.number().int().positive().nullable().optional(),
  floorId: z.number().int().positive().nullable().optional(),
  unitNumber: z.string().trim().min(1).max(50),
  bhkType: z.string().trim().max(50).nullable().optional(),
  superBuiltUpArea: z.number().nonnegative().nullable().optional(),
  carpetArea: z.number().nonnegative().nullable().optional(),
  facing: z.string().trim().max(50).nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  plcCharges: z.number().nonnegative().nullable().optional(),
  availability: unitAvailabilitySchema.default("AVAILABLE"),
});

export const listProjectsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    status: projectStatusSchema.optional(),
    city: z.string().trim().max(100).optional(),
    sortBy: z.enum(["project_name", "project_code", "created_at", "status"]).default("created_at"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const createProjectSchema = z.object({ body: projectBodySchema });
export const updateProjectSchema = uuidParamSchema.extend({ body: projectBodySchema.partial() });
export const getProjectSchema = uuidParamSchema;
export const deleteProjectSchema = uuidParamSchema;

export const listUnitsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    projectId: z.coerce.number().int().positive().optional(),
    towerId: z.coerce.number().int().positive().optional(),
    floorId: z.coerce.number().int().positive().optional(),
    availability: unitAvailabilitySchema.optional(),
    bhkType: z.string().trim().max(50).optional(),
    sortBy: z.enum(["unit_number", "price", "created_at", "availability"]).default("created_at"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const createUnitSchema = z.object({ body: unitBodySchema });
export const updateUnitSchema = uuidParamSchema.extend({ body: unitBodySchema.partial() });
export const getUnitSchema = uuidParamSchema;
export const deleteUnitSchema = uuidParamSchema;

export const createTowerSchema = uuidParamSchema.extend({
  body: z.object({
    towerName: z.string().trim().min(1).max(100),
    numberOfFloors: z.number().int().min(0).max(200),
  }),
});

export const updateTowerSchema = z.object({
  params: z.object({ uuid: z.string().uuid() }),
  body: z.object({
    towerName: z.string().trim().min(1).max(100).optional(),
    numberOfFloors: z.number().int().min(0).max(200).optional(),
  }),
});

export const deleteTowerSchema = z.object({
  params: z.object({ uuid: z.string().uuid() }),
});

export const createFloorSchema = z.object({
  params: z.object({ uuid: z.string().uuid() }),
  body: z.object({
    floorNumber: z.number().int().min(-5).max(200),
  }),
});

export const deleteFloorSchema = z.object({
  params: z.object({ uuid: z.string().uuid() }),
});

export const towerParamSchema = z.object({
  params: z.object({ uuid: z.string().uuid() }),
});

export type ListProjectsQuery = z.infer<typeof listProjectsSchema>["query"];
export type CreateProjectInput = z.infer<typeof createProjectSchema>["body"];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>["body"];
export type ListUnitsQuery = z.infer<typeof listUnitsSchema>["query"];
export type CreateUnitInput = z.infer<typeof createUnitSchema>["body"];
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>["body"];
