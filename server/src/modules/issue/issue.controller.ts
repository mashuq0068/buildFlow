import { RequestHandler } from "express";
import { issueService } from "./issue.service";
import { projectService } from "../project/project.service";

const create: RequestHandler = async (req, res, next) => {
  try {
    const issue = await issueService.createIssue(req.user!.id, req.body);
    res.status(201).json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

const getAll: RequestHandler = async (req, res, next) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    if (projectId) {
      const includeArchived = req.query.archived === "true";
      const issues = await issueService.getIssuesByProject(req.user!.id, projectId, includeArchived);
      return res.json({ success: true, data: issues });
    }

    const workspaceId = req.query.workspaceId as string;
    const projects = await projectService.getProjectsForUser(req.user!.id, workspaceId);
    const issues = await issueService.getIssuesForProjects(projects.map((p) => p.id));
    res.json({ success: true, data: issues });
  } catch (err) {
    next(err);
  }
};

const reorder: RequestHandler = async (req, res, next) => {
  try {
    const { projectId, statusId, orderedIds } = req.body;
    const issues = await issueService.reorderColumn(req.user!.id, projectId, statusId, orderedIds);
    res.json({ success: true, data: issues });
  } catch (err) {
    next(err);
  }
};

const getById: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const issue = await issueService.getIssueById(req.user!.id, req.params.id);
    res.json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

const update: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const issue = await issueService.updateIssue(req.user!.id, req.params.id, req.body);
    res.json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

const updateStatus: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const issue = await issueService.updateStatus(req.user!.id, req.params.id, req.body.statusId);
    res.json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

const remove: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    await issueService.deleteIssue(req.user!.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const archive: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const issue = await issueService.setArchived(req.user!.id, req.params.id, Boolean(req.body.archived));
    res.json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

const aiSuggest: RequestHandler = async (req, res, next) => {
  try {
    const result = issueService.suggestLabelsForTitle(req.body.title);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const issueController = {
  create,
  getAll,
  getById,
  update,
  updateStatus,
  reorder,
  remove,
  archive,
  aiSuggest,
};
