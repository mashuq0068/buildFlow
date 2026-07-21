import { RequestHandler } from "express";
import { projectChatService } from "./project-chat.service";

const getAll: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const messages = await projectChatService.listMessages(req.user!.id, req.params.id);
    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};

const create: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const message = await projectChatService.createMessage(
      req.user!.id,
      req.params.id,
      req.body.body
    );
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};

export const projectChatController = { getAll, create };
