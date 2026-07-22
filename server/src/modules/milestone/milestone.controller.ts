import { RequestHandler } from "express";
import { milestoneService } from "./milestone.service";
import { projectService } from "../project/project.service";

const create: RequestHandler = async (req, res, next) => {
  try {
    const milestone = await milestoneService.createMilestone(req.user!.id, req.body);
    res.status(201).json({ success: true, data: milestone });
  } catch (err) {
    next(err);
  }
};

const getAll: RequestHandler = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspaceId as string;
    const projects = await projectService.getProjectsForUser(req.user!.id, workspaceId);
    const milestones = await milestoneService.getMilestonesForUser(
      req.user!.id,
      projects.map((p) => p.id)
    );
    res.json({ success: true, data: milestones });
  } catch (err) {
    next(err);
  }
};

const update: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const milestone = await milestoneService.updateMilestone(req.user!.id, req.params.id, req.body);
    res.json({ success: true, data: milestone });
  } catch (err) {
    next(err);
  }
};

const remove: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    await milestoneService.deleteMilestone(req.user!.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const milestoneController = { create, getAll, update, remove };
