import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/utils/validate.js";
import { PropertyController } from "./property.controller.js";
import { propertyService } from "./property.service.js";
import {
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
  towerParamSchema,
  updateTowerSchema,
  updateUnitSchema,
} from "./property.validation.js";

const propertyController = new PropertyController(propertyService);

const projectUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const lowerName = file.originalname.toLowerCase();
    if (file.fieldname === "brochure") {
      callback(null, lowerName.endsWith(".pdf"));
      return;
    }

    if (file.fieldname === "images") {
      const allowed = [".jpg", ".jpeg", ".png", ".webp"];
      callback(null, allowed.some((ext) => lowerName.endsWith(ext)));
      return;
    }

    callback(new Error("Invalid upload field"));
  },
});

export const projectsRouter = Router();
export const unitsRouter = Router();

projectsRouter.use(authenticate);

projectsRouter.get("/inventory/dashboard", authorize("projects.view"), propertyController.getInventoryDashboard);
projectsRouter.get("/form-options", authorize("projects.view"), propertyController.getFormOptions);

projectsRouter.get("/", authorize("projects.view"), validate(listProjectsSchema), propertyController.listProjects);

projectsRouter.put("/towers/:uuid", authorize("projects.update"), validate(updateTowerSchema), propertyController.updateTower);
projectsRouter.delete("/towers/:uuid", authorize("projects.update"), validate(deleteTowerSchema), propertyController.deleteTower);
projectsRouter.get("/towers/:uuid/floors", authorize("projects.view"), validate(towerParamSchema), propertyController.listFloors);
projectsRouter.post("/towers/:uuid/floors", authorize("projects.update"), validate(createFloorSchema), propertyController.createFloor);
projectsRouter.delete("/floors/:uuid", authorize("projects.update"), validate(deleteFloorSchema), propertyController.deleteFloor);

projectsRouter.get("/:uuid", authorize("projects.view"), validate(getProjectSchema), propertyController.getProjectByUuid);
projectsRouter.post("/:uuid/towers", authorize("projects.update"), validate(createTowerSchema), propertyController.createTower);

projectsRouter.post(
  "/",
  authorize("projects.create"),
  projectUpload.fields([
    { name: "images", maxCount: 10 },
    { name: "brochure", maxCount: 1 },
  ]),
  propertyController.createProject,
);

projectsRouter.put(
  "/:uuid",
  authorize("projects.update"),
  validate(getProjectSchema),
  projectUpload.fields([
    { name: "images", maxCount: 10 },
    { name: "brochure", maxCount: 1 },
  ]),
  propertyController.updateProject,
);

projectsRouter.delete("/:uuid", authorize("projects.delete"), validate(deleteProjectSchema), propertyController.deleteProject);

unitsRouter.use(authenticate);

unitsRouter.get("/form-options", authorize("projects.view"), propertyController.getFormOptions);
unitsRouter.get("/", authorize("projects.view"), validate(listUnitsSchema), propertyController.listUnits);
unitsRouter.get("/:uuid", authorize("projects.view"), validate(getUnitSchema), propertyController.getUnitByUuid);
unitsRouter.post("/", authorize("projects.create"), validate(createUnitSchema), propertyController.createUnit);
unitsRouter.put("/:uuid", authorize("projects.update"), validate(updateUnitSchema), propertyController.updateUnit);
unitsRouter.delete("/:uuid", authorize("projects.delete"), validate(deleteUnitSchema), propertyController.deleteUnit);

export default projectsRouter;
