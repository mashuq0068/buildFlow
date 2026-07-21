import { Router } from "express";
import { issueController } from "./issue.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { issueValidation } from "./issue.validation";

const router = Router();

router.post("/", validateRequest(issueValidation.create), issueController.create);
router.get("/", issueController.getAll);
router.get("/:id", issueController.getById);
router.patch("/:id", validateRequest(issueValidation.update), issueController.update);
router.patch(
  "/:id/status",
  validateRequest(issueValidation.updateStatus),
  issueController.updateStatus
);
router.delete("/:id", issueController.remove);

export const issueRoutes = router;
