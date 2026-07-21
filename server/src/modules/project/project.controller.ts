import { RequestHandler } from "express";
import { projectService } from "./project.service";

const create: RequestHandler = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

const getAll: RequestHandler = async (req, res, next) => {
  try {
    const teamId = req.query.teamId as string;
    const projects = await projectService.getProjectsByTeam(teamId);
    res.json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
};

const getById: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

const update: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

const remove: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const projectController = { create, getAll, getById, update, remove };
