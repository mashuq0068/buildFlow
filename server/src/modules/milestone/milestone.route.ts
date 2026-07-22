import { Router } from "express";
import { milestoneController } from "./milestone.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { milestoneValidation } from "./milestone.validation";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router();

router.use(requireAuth);

router.post("/", validateRequest(milestoneValidation.create), milestoneController.create);
router.get("/", milestoneController.getAll);
router.patch("/:id", validateRequest(milestoneValidation.update), milestoneController.update);
router.delete("/:id", milestoneController.remove);

export const milestoneRoutes = router;
