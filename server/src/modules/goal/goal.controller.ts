import { RequestHandler } from "express";
import { goalService } from "./goal.service";
import { projectService } from "../project/project.service";

const create: RequestHandler = async (req, res, next) => {
  try {
    const goal = await goalService.createGoal(req.user!.id, req.body);
    res.status(201).json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
};

const getAll: RequestHandler = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspaceId as string;
    const projects = await projectService.getProjectsForUser(req.user!.id, workspaceId);
    const goals = await goalService.getGoalsForUser(
      req.user!.id,
      projects.map((p) => p.id)
    );
    res.json({ success: true, data: goals });
  } catch (err) {
    next(err);
  }
};

const update: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const goal = await goalService.updateGoal(req.user!.id, req.params.id, req.body);
    res.json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
};

const remove: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    await goalService.deleteGoal(req.user!.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const goalController = { create, getAll, update, remove };
