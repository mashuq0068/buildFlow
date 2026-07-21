import { Router } from "express";
import { projectController } from "./project.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { projectValidation } from "./project.validation";

const router = Router();

router.post("/", validateRequest(projectValidation.create), projectController.create);
router.get("/", projectController.getAll);
router.get("/:id", projectController.getById);
router.patch("/:id", validateRequest(projectValidation.update), projectController.update);
router.delete("/:id", projectController.remove);

export const projectRoutes = router;
