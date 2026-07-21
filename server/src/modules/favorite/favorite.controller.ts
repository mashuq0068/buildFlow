import { RequestHandler } from "express";
import { favoriteService } from "./favorite.service";

const add: RequestHandler<{ issueId: string }> = async (req, res, next) => {
  try {
    await favoriteService.addFavorite(req.user!.id, req.params.issueId);
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
};

const remove: RequestHandler<{ issueId: string }> = async (req, res, next) => {
  try {
    await favoriteService.removeFavorite(req.user!.id, req.params.issueId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const list: RequestHandler = async (req, res, next) => {
  try {
    const issueIds = await favoriteService.listFavoriteIssueIds(req.user!.id);
    res.json({ success: true, data: issueIds });
  } catch (err) {
    next(err);
  }
};

export const favoriteController = { add, remove, list };
