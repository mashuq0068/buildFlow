import { RequestHandler } from "express";
import { commentService } from "./comment.service";

const getAll: RequestHandler<{ issueId: string }> = async (req, res, next) => {
  try {
    const comments = await commentService.listByIssue(req.user!.id, req.params.issueId);
    res.json({ success: true, data: comments });
  } catch (err) {
    next(err);
  }
};

const create: RequestHandler<{ issueId: string }> = async (req, res, next) => {
  try {
    const comment = await commentService.createComment(
      req.user!.id,
      req.params.issueId,
      req.body.body
    );
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
};

export const commentController = { getAll, create };
