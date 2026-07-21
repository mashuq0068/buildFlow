import { Router } from "express";
import { notificationController } from "./notification.controller";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router();

router.use(requireAuth);

router.get("/", notificationController.getAll);
router.patch("/read-all", notificationController.markAllRead);
router.patch("/:id/read", notificationController.markRead);

export const notificationRoutes = router;
