import { RequestHandler } from "express";
import { workspaceService } from "./workspace.service";

const create: RequestHandler = async (req, res, next) => {
  try {
    const workspace = await workspaceService.createWorkspace(req.body);
    res.status(201).json({ success: true, data: workspace });
  } catch (err) {
    next(err);
  }
};

const getAll: RequestHandler = async (_req, res, next) => {
  try {
    const workspaces = await workspaceService.getWorkspaces();
    res.json({ success: true, data: workspaces });
  } catch (err) {
    next(err);
  }
};

const getById: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const workspace = await workspaceService.getWorkspaceById(req.params.id);
    res.json({ success: true, data: workspace });
  } catch (err) {
    next(err);
  }
};

const update: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const workspace = await workspaceService.updateWorkspace(req.params.id, req.body);
    res.json({ success: true, data: workspace });
  } catch (err) {
    next(err);
  }
};

const remove: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    await workspaceService.deleteWorkspace(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const workspaceController = { create, getAll, getById, update, remove };
