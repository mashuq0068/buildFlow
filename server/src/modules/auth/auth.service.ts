import { prisma } from "../../lib/prisma";
import { hashPassword, comparePassword } from "../../lib/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  refreshExpiryDate,
} from "../../lib/jwt";
import { HttpError } from "../../lib/http-error";
import { safeUserSelect } from "../../lib/user-select";
import type { IRegisterInput, ILoginInput } from "./auth.interface";

function initialsFor(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

async function issueTokens(user: { id: string; email: string; name: string }) {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, name: user.name });
  const refreshToken = signRefreshToken({ sub: user.id });

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: refreshExpiryDate(),
    },
  });

  return { accessToken, refreshToken };
}

async function register(input: IRegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (existing) throw new HttpError(409, "An account with that email already exists");

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      initials: initialsFor(input.name),
    },
    select: safeUserSelect,
  });

  const tokens = await issueTokens(user);
  return { user, ...tokens };
}

async function login(input: ILoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { ...safeUserSelect, passwordHash: true },
  });
  if (!user) throw new HttpError(401, "Invalid email or password");

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) throw new HttpError(401, "Invalid email or password");

  const tokens = await issueTokens(user);
  return { user, ...tokens };
}

async function refresh(refreshTokenRaw: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshTokenRaw);
  } catch {
    throw new HttpError(401, "Invalid refresh token");
  }

  const tokenHash = hashToken(refreshTokenRaw);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.userId !== payload.sub) {
    throw new HttpError(401, "Refresh token not recognized");
  }

  if (stored.revokedAt) {
    // Reuse of an already-rotated token — treat as a possible theft and kill the whole chain.
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new HttpError(401, "Refresh token has already been used — please log in again");
  }

  if (stored.expiresAt < new Date()) {
    throw new HttpError(401, "Refresh token expired");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: stored.userId },
    select: safeUserSelect,
  });
  const tokens = await issueTokens(user);

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date(), replacedByTokenHash: hashToken(tokens.refreshToken) },
  });

  return { user, ...tokens };
}

async function logout(refreshTokenRaw: string | undefined) {
  if (!refreshTokenRaw) return;
  const tokenHash = hashToken(refreshTokenRaw);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

async function getMe(userId: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      ...safeUserSelect,
      memberships: { include: { workspace: true } },
    },
  });
}

export const authService = { register, login, refresh, logout, getMe };
