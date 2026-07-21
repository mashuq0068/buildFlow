import { Router } from "express";
import { issueController } from "./issue.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { issueValidation } from "./issue.validation";
import { requireAuth } from "../../middlewares/requireAuth";
import { commentRoutes } from "../comment/comment.route";
import { favoriteRoutes } from "../favorite/favorite.route";

const router = Router();

router.use(requireAuth);

router.post("/", validateRequest(issueValidation.create), issueController.create);
router.get("/", issueController.getAll);
router.post("/ai-suggest", validateRequest(issueValidation.aiSuggest), issueController.aiSuggest);
router.patch("/reorder", validateRequest(issueValidation.reorder), issueController.reorder);
router.get("/:id", issueController.getById);
router.patch("/:id", validateRequest(issueValidation.update), issueController.update);
router.patch(
  "/:id/status",
  validateRequest(issueValidation.updateStatus),
  issueController.updateStatus
);
router.delete("/:id", issueController.remove);
router.patch("/:id/archive", issueController.archive);
router.use("/:issueId/comments", commentRoutes);
router.use("/:issueId/favorite", favoriteRoutes);

export const issueRoutes = router;
