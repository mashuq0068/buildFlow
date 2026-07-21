import { RequestHandler } from "express";
import { inviteService } from "./invite.service";
import { setAuthCookies, serializeUser } from "../../lib/auth-cookies";

const create: RequestHandler<{ workspaceId: string }> = async (req, res, next) => {
  try {
    const invite = await inviteService.createInvite(req.user!.id, req.params.workspaceId, req.body);
    res.status(201).json({ success: true, data: invite });
  } catch (err) {
    next(err);
  }
};

const getAll: RequestHandler<{ workspaceId: string }> = async (req, res, next) => {
  try {
    const invites = await inviteService.listInvites(req.user!.id, req.params.workspaceId);
    res.json({ success: true, data: invites });
  } catch (err) {
    next(err);
  }
};

const resend: RequestHandler<{ workspaceId: string; inviteId: string }> = async (req, res, next) => {
  try {
    const invite = await inviteService.resendInvite(
      req.user!.id,
      req.params.workspaceId,
      req.params.inviteId
    );
    res.json({ success: true, data: invite });
  } catch (err) {
    next(err);
  }
};

const cancel: RequestHandler<{ workspaceId: string; inviteId: string }> = async (req, res, next) => {
  try {
    await inviteService.cancelInvite(req.user!.id, req.params.workspaceId, req.params.inviteId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const getByToken: RequestHandler<{ token: string }> = async (req, res, next) => {
  try {
    const invite = await inviteService.getInviteByToken(req.params.token);
    res.json({
      success: true,
      data: {
        email: invite.email,
        role: invite.role,
        status: invite.status,
        workspaceName: invite.workspace.name,
        workspaceColor: invite.workspace.color,
      },
    });
  } catch (err) {
    next(err);
  }
};

const accept: RequestHandler<{ token: string }> = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await inviteService.acceptInvite(
      req.params.token,
      req.body
    );
    setAuthCookies(res, accessToken, refreshToken);
    res.json({ success: true, data: serializeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const inviteController = { create, getAll, resend, cancel, getByToken, accept };
