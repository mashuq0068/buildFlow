import { RequestHandler } from "express";
import { labelService } from "./label.service";

const getAll: RequestHandler = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspaceId as string;
    const labels = await labelService.listByWorkspace(req.user!.id, workspaceId);
    res.json({ success: true, data: labels });
  } catch (err) {
    next(err);
  }
};

export const labelController = { getAll };
