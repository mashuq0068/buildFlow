import { RequestHandler } from "express";
import { notificationService } from "./notification.service";

const getAll: RequestHandler = async (req, res, next) => {
  try {
    const notifications = await notificationService.listForUser(req.user!.id);
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
};

const markRead: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    await notificationService.markRead(req.user!.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const markAllRead: RequestHandler = async (req, res, next) => {
  try {
    await notificationService.markAllRead(req.user!.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const notificationController = { getAll, markRead, markAllRead };
