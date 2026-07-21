import { RequestHandler } from "express";
import { cycleService } from "./cycle.service";
import { projectService } from "../project/project.service";

const create: RequestHandler = async (req, res, next) => {
  try {
    const cycle = await cycleService.createCycle(req.user!.id, req.body);
    res.status(201).json({ success: true, data: cycle });
  } catch (err) {
    next(err);
  }
};

const getAll: RequestHandler = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspaceId as string;
    const projects = await projectService.getProjectsForUser(req.user!.id, workspaceId);
    const cycles = await cycleService.getCyclesForUser(
      req.user!.id,
      projects.map((p) => p.id)
    );
    res.json({ success: true, data: cycles });
  } catch (err) {
    next(err);
  }
};

const getById: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const cycle = await cycleService.getCycleById(req.user!.id, req.params.id);
    res.json({ success: true, data: cycle });
  } catch (err) {
    next(err);
  }
};

const update: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const cycle = await cycleService.updateCycle(req.user!.id, req.params.id, req.body);
    res.json({ success: true, data: cycle });
  } catch (err) {
    next(err);
  }
};

const remove: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    await cycleService.deleteCycle(req.user!.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const cycleController = { create, getAll, getById, update, remove };
