import { Router } from "express";
import { teamController } from "./team.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { teamValidation } from "./team.validation";

const router = Router();

router.post("/", validateRequest(teamValidation.create), teamController.create);
router.get("/", teamController.getAll);
router.get("/:id", teamController.getById);
router.patch("/:id", validateRequest(teamValidation.update), teamController.update);
router.delete("/:id", teamController.remove);

export const teamRoutes = router;
