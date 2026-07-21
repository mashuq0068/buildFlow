import { Router } from "express";
import { projectChatController } from "./project-chat.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { projectChatValidation } from "./project-chat.validation";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get("/", projectChatController.getAll);
router.post("/", validateRequest(projectChatValidation.create), projectChatController.create);

export const projectChatRoutes = router;
