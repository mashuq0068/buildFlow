import { Response } from "express";
import { config } from "../config";

export const ACCESS_COOKIE = "accessToken";
export const REFRESH_COOKIE = "refreshToken";

function cookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    // Client and server sit on different domains in production (e.g. two separate
    // Vercel deployments), which browsers treat as cross-site — "lax" silently drops
    // the cookie on cross-origin fetch/XHR. "none" is required for that to work, but
    // browsers only honor "none" when secure=true, so keep "lax" for local http dev.
    sameSite: config.cookieSecure ? ("none" as const) : ("lax" as const),
    maxAge: maxAgeMs,
    path: "/",
  };
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_COOKIE, accessToken, cookieOptions(config.jwt.accessTtlMin * 60 * 1000));
  res.cookie(
    REFRESH_COOKIE,
    refreshToken,
    cookieOptions(config.jwt.refreshTtlDays * 24 * 60 * 60 * 1000)
  );
}

export function serializeUser(user: {
  id: string;
  name: string;
  email: string;
  initials: string;
  title: string | null;
  avatarUrl?: string | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    initials: user.initials,
    title: user.title,
    avatarUrl: user.avatarUrl ?? null,
  };
}
