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
      req.body.body,
      req.body.parentId,
      req.body.attachments
    );
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
};

const update: RequestHandler<{ issueId: string; commentId: string }> = async (req, res, next) => {
  try {
    const comment = await commentService.updateComment(
      req.user!.id,
      req.params.commentId,
      req.body.body
    );
    res.json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
};

const remove: RequestHandler<{ issueId: string; commentId: string }> = async (req, res, next) => {
  try {
    await commentService.deleteComment(req.user!.id, req.params.commentId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const react: RequestHandler<{ issueId: string; commentId: string }> = async (req, res, next) => {
  try {
    const comment = await commentService.toggleReaction(
      req.user!.id,
      req.params.commentId,
      req.body.emoji
    );
    res.json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
};

export const commentController = { getAll, create, update, remove, react };
