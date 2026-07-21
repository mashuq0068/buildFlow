import { Router } from "express";
import { cycleController } from "./cycle.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { cycleValidation } from "./cycle.validation";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router();

router.use(requireAuth);

router.post("/", validateRequest(cycleValidation.create), cycleController.create);
router.get("/", cycleController.getAll);
router.get("/:id", cycleController.getById);
router.patch("/:id", validateRequest(cycleValidation.update), cycleController.update);
router.delete("/:id", cycleController.remove);

export const cycleRoutes = router;
