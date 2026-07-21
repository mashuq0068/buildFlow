import { RequestHandler } from "express";
import { authService } from "./auth.service";
import { ACCESS_COOKIE, REFRESH_COOKIE, setAuthCookies, serializeUser } from "../../lib/auth-cookies";

const register: RequestHandler = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    setAuthCookies(res, accessToken, refreshToken);
    res.status(201).json({ success: true, data: serializeUser(user) });
  } catch (err) {
    next(err);
  }
};

const login: RequestHandler = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    setAuthCookies(res, accessToken, refreshToken);
    res.json({ success: true, data: serializeUser(user) });
  } catch (err) {
    next(err);
  }
};

const refresh: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) {
      return res.status(401).json({ success: false, message: "No refresh token" });
    }
    const { user, accessToken, refreshToken } = await authService.refresh(token);
    setAuthCookies(res, accessToken, refreshToken);
    res.json({ success: true, data: serializeUser(user) });
  } catch (err) {
    next(err);
  }
};

const logout: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    await authService.logout(token);
    res.clearCookie(ACCESS_COOKIE, { path: "/" });
    res.clearCookie(REFRESH_COOKIE, { path: "/" });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const me: RequestHandler = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user!.id);
    res.json({
      success: true,
      data: {
        ...serializeUser(user),
        workspaces: user.memberships.map((m) => ({
          id: m.workspace.id,
          name: m.workspace.name,
          slug: m.workspace.slug,
          color: m.workspace.color,
          role: m.role,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const authController = { register, login, refresh, logout, me };
