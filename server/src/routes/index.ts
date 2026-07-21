import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { workspaceRoutes } from "../modules/workspace/workspace.route";
import { projectRoutes } from "../modules/project/project.route";
import { issueRoutes } from "../modules/issue/issue.route";
import { cycleRoutes } from "../modules/cycle/cycle.route";
import { goalRoutes } from "../modules/goal/goal.route";
import { labelRoutes } from "../modules/label/label.route";
import { draftRoutes } from "../modules/draft/draft.route";
import { notificationRoutes } from "../modules/notification/notification.route";
import { activityRoutes } from "../modules/activity/activity.route";
import { favoriteListRoutes } from "../modules/favorite/favorite.route";
import { uploadRoutes } from "../modules/upload/upload.route";
import { invitePublicRoutes } from "../modules/invite/invite.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/projects", projectRoutes);
router.use("/issues", issueRoutes);
router.use("/cycles", cycleRoutes);
router.use("/goals", goalRoutes);
router.use("/labels", labelRoutes);
router.use("/drafts", draftRoutes);
router.use("/notifications", notificationRoutes);
router.use("/activity", activityRoutes);
router.use("/favorites", favoriteListRoutes);
router.use("/uploads", uploadRoutes);
router.use("/invites", invitePublicRoutes);

export default router;
