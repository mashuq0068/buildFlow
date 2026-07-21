import { RequestHandler } from "express";
import { projectService } from "./project.service";

const create: RequestHandler = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.user!.id, req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

const getAll: RequestHandler = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspaceId as string;
    const projects = await projectService.getProjectsForUser(req.user!.id, workspaceId);
    res.json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
};

const getById: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.user!.id, req.params.id);
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

const update: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.user!.id, req.params.id, req.body);
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

const remove: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.user!.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const addMembers: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const project = await projectService.addMembers(req.user!.id, req.params.id, req.body.userIds);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

const removeMember: RequestHandler<{ id: string; userId: string }> = async (req, res, next) => {
  try {
    await projectService.removeMember(req.user!.id, req.params.id, req.params.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const projectController = { create, getAll, getById, update, remove, addMembers, removeMember };
