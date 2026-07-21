import { RequestHandler } from "express";
import { activityService } from "./activity.service";
import { projectService } from "../project/project.service";

const getRecent: RequestHandler = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspaceId as string;
    const projects = await projectService.getProjectsForUser(req.user!.id, workspaceId);
    const activity = await activityService.listRecentForProjects(projects.map((p) => p.id));
    res.json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
};

export const activityController = { getRecent };
