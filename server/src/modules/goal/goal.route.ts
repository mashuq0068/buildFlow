import { Router } from "express";
import { goalController } from "./goal.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { goalValidation } from "./goal.validation";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router();

router.use(requireAuth);

router.post("/", validateRequest(goalValidation.create), goalController.create);
router.get("/", goalController.getAll);
router.patch("/:id", validateRequest(goalValidation.update), goalController.update);
router.delete("/:id", goalController.remove);

export const goalRoutes = router;
