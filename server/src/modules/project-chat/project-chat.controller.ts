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
      req.body.body,
      req.body.parentId,
      req.body.attachments
    );
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};

const update: RequestHandler<{ id: string; messageId: string }> = async (req, res, next) => {
  try {
    const message = await projectChatService.updateMessage(
      req.user!.id,
      req.params.messageId,
      req.body.body
    );
    res.json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};

const remove: RequestHandler<{ id: string; messageId: string }> = async (req, res, next) => {
  try {
    await projectChatService.deleteMessage(req.user!.id, req.params.messageId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const react: RequestHandler<{ id: string; messageId: string }> = async (req, res, next) => {
  try {
    const message = await projectChatService.toggleReaction(
      req.user!.id,
      req.params.messageId,
      req.body.emoji
    );
    res.json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};

export const projectChatController = { getAll, create, update, remove, react };
