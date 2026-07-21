import { Router } from "express";
import { issueStatusController } from "./issue-status.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { issueStatusValidation } from "./issue-status.validation";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get("/", issueStatusController.getAll);
router.post("/", validateRequest(issueStatusValidation.create), issueStatusController.create);
router.patch(
  "/reorder",
  validateRequest(issueStatusValidation.reorder),
  issueStatusController.reorder
);
router.patch(
  "/:statusId",
  validateRequest(issueStatusValidation.update),
  issueStatusController.update
);
router.delete("/:statusId", issueStatusController.remove);

export const issueStatusRoutes = router;
