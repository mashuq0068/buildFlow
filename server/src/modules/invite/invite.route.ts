import { Router } from "express";
import { inviteController } from "./invite.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { inviteValidation } from "./invite.validation";
import { requireAuth } from "../../middlewares/requireAuth";

// Admin-facing management, nested under /workspaces/:workspaceId/invites.
const managementRouter = Router({ mergeParams: true });
managementRouter.use(requireAuth);
managementRouter.get("/", inviteController.getAll);
managementRouter.post("/", validateRequest(inviteValidation.create), inviteController.create);
managementRouter.post("/:inviteId/resend", inviteController.resend);
managementRouter.delete("/:inviteId", inviteController.cancel);

// Public, unauthenticated — the link an invitee actually opens, mounted at /invites.
const publicRouter = Router();
publicRouter.get("/:token", inviteController.getByToken);
publicRouter.post(
  "/:token/accept",
  validateRequest(inviteValidation.accept),
  inviteController.accept
);

export const inviteManagementRoutes = managementRouter;
export const invitePublicRoutes = publicRouter;
