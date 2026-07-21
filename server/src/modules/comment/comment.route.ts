import { Router } from "express";
import { commentController } from "./comment.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { commentValidation } from "./comment.validation";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get("/", commentController.getAll);
router.post("/", validateRequest(commentValidation.create), commentController.create);

export const commentRoutes = router;
