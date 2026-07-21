import { Router } from "express";
import { workspaceRoutes } from "../modules/workspace/workspace.route";
import { teamRoutes } from "../modules/team/team.route";
import { projectRoutes } from "../modules/project/project.route";
import { issueRoutes } from "../modules/issue/issue.route";

const router = Router();

router.use("/workspaces", workspaceRoutes);
router.use("/teams", teamRoutes);
router.use("/projects", projectRoutes);
router.use("/issues", issueRoutes);

export default router;
