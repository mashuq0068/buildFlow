import { Router } from "express";
import { workspaceController } from "./workspace.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { workspaceValidation } from "./workspace.validation";

const router = Router();

router.post("/", validateRequest(workspaceValidation.create), workspaceController.create);
router.get("/", workspaceController.getAll);
router.get("/:id", workspaceController.getById);
router.patch("/:id", validateRequest(workspaceValidation.update), workspaceController.update);
router.delete("/:id", workspaceController.remove);

export const workspaceRoutes = router;
