import { RequestHandler } from "express";
import { issueService } from "./issue.service";

const create: RequestHandler = async (req, res, next) => {
  try {
    const issue = await issueService.createIssue(req.body);
    res.status(201).json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

const getAll: RequestHandler = async (req, res, next) => {
  try {
    const projectId = req.query.projectId as string;
    const issues = await issueService.getIssuesByProject(projectId);
    res.json({ success: true, data: issues });
  } catch (err) {
    next(err);
  }
};

const getById: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const issue = await issueService.getIssueById(req.params.id);
    res.json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

const update: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const issue = await issueService.updateIssue(req.params.id, req.body);
    res.json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

const updateStatus: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const issue = await issueService.updateIssueStatus(req.params.id, req.body.status);
    res.json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

const remove: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    await issueService.deleteIssue(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const issueController = { create, getAll, getById, update, updateStatus, remove };
