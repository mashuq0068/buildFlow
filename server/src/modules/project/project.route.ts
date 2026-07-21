import { Router } from "express";
import { projectController } from "./project.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { projectValidation } from "./project.validation";
import { requireAuth } from "../../middlewares/requireAuth";
import { projectChatRoutes } from "../project-chat/project-chat.route";

const router = Router();

router.use(requireAuth);

router.post("/", validateRequest(projectValidation.create), projectController.create);
router.get("/", projectController.getAll);
router.get("/:id", projectController.getById);
router.patch("/:id", validateRequest(projectValidation.update), projectController.update);
router.delete("/:id", projectController.remove);
router.post(
  "/:id/members",
  validateRequest(projectValidation.addMembers),
  projectController.addMembers
);
router.delete("/:id/members/:userId", projectController.removeMember);
router.use("/:id/chat", projectChatRoutes);

export const projectRoutes = router;
