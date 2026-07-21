import { RequestHandler } from "express";
import { draftService } from "./draft.service";

const create: RequestHandler = async (req, res, next) => {
  try {
    const draft = await draftService.createDraft(req.user!.id, req.body);
    res.status(201).json({ success: true, data: draft });
  } catch (err) {
    next(err);
  }
};

const getAll: RequestHandler = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspaceId as string;
    const drafts = await draftService.listForUser(req.user!.id, workspaceId);
    res.json({ success: true, data: drafts });
  } catch (err) {
    next(err);
  }
};

const update: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const draft = await draftService.updateDraft(req.user!.id, req.params.id, req.body);
    res.json({ success: true, data: draft });
  } catch (err) {
    next(err);
  }
};

const remove: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    await draftService.deleteDraft(req.user!.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const publish: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const issue = await draftService.publishDraft(req.user!.id, req.params.id);
    res.status(201).json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

export const draftController = { create, getAll, update, remove, publish };
