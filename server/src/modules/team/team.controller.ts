import { RequestHandler } from "express";
import { teamService } from "./team.service";

const create: RequestHandler = async (req, res, next) => {
  try {
    const team = await teamService.createTeam(req.body);
    res.status(201).json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
};

const getAll: RequestHandler = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspaceId as string;
    const teams = await teamService.getTeamsByWorkspace(workspaceId);
    res.json({ success: true, data: teams });
  } catch (err) {
    next(err);
  }
};

const getById: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const team = await teamService.getTeamById(req.params.id);
    res.json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
};

const update: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const team = await teamService.updateTeam(req.params.id, req.body);
    res.json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
};

const remove: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    await teamService.deleteTeam(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const teamController = { create, getAll, getById, update, remove };
