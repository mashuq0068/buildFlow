import { RequestHandler } from "express";
import { userService } from "./user.service";

const listMembers: RequestHandler<{ workspaceId: string }> = async (req, res, next) => {
  try {
    const members = await userService.listWorkspaceMembers(req.user!.id, req.params.workspaceId);
    res.json({ success: true, data: members });
  } catch (err) {
    next(err);
  }
};

const addMember: RequestHandler<{ workspaceId: string }> = async (req, res, next) => {
  try {
    const member = await userService.addMember(req.user!.id, req.params.workspaceId, req.body);
    res.status(201).json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
};

const updateMemberRole: RequestHandler<{ workspaceId: string; userId: string }> = async (
  req,
  res,
  next
) => {
  try {
    const member = await userService.updateMemberRole(
      req.user!.id,
      req.params.workspaceId,
      req.params.userId,
      req.body.role
    );
    res.json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
};

export const userController = { listMembers, addMember, updateMemberRole };
