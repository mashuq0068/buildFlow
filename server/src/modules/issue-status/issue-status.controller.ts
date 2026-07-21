import { RequestHandler } from "express";
import { issueStatusService } from "./issue-status.service";

const getAll: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const statuses = await issueStatusService.listForProject(req.user!.id, req.params.id);
    res.json({ success: true, data: statuses });
  } catch (err) {
    next(err);
  }
};

const create: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const status = await issueStatusService.createStatusOption(req.user!.id, req.params.id, req.body);
    res.status(201).json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
};

const update: RequestHandler<{ id: string; statusId: string }> = async (req, res, next) => {
  try {
    const status = await issueStatusService.updateStatusOption(
      req.user!.id,
      req.params.id,
      req.params.statusId,
      req.body
    );
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
};

const remove: RequestHandler<{ id: string; statusId: string }> = async (req, res, next) => {
  try {
    await issueStatusService.deleteStatusOption(req.user!.id, req.params.id, req.params.statusId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const reorder: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const statuses = await issueStatusService.reorderStatusOptions(
      req.user!.id,
      req.params.id,
      req.body.orderedIds
    );
    res.json({ success: true, data: statuses });
  } catch (err) {
    next(err);
  }
};

export const issueStatusController = { getAll, create, update, remove, reorder };
