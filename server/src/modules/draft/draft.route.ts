import { Router } from "express";
import { draftController } from "./draft.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { draftValidation } from "./draft.validation";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router();

router.use(requireAuth);

router.post("/", validateRequest(draftValidation.create), draftController.create);
router.get("/", draftController.getAll);
router.patch("/:id", validateRequest(draftValidation.update), draftController.update);
router.delete("/:id", draftController.remove);
router.post("/:id/publish", draftController.publish);

export const draftRoutes = router;
