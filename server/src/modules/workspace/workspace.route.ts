import { Router } from "express";
import { workspaceController } from "./workspace.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { workspaceValidation } from "./workspace.validation";
import { requireAuth } from "../../middlewares/requireAuth";
import { userRoutes } from "../user/user.route";
import { inviteManagementRoutes } from "../invite/invite.route";

const router = Router();

router.use(requireAuth);

router.post("/", validateRequest(workspaceValidation.create), workspaceController.create);
router.get("/", workspaceController.getAll);
router.get("/:id", workspaceController.getById);
router.patch("/:id", validateRequest(workspaceValidation.update), workspaceController.update);
router.delete("/:id", workspaceController.remove);
router.use("/:workspaceId/members", userRoutes);
router.use("/:workspaceId/invites", inviteManagementRoutes);

export const workspaceRoutes = router;
