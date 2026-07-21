import { Router } from "express";
import { activityController } from "./activity.controller";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router();

router.use(requireAuth);
router.get("/", activityController.getRecent);

export const activityRoutes = router;
