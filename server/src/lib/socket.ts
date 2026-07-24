import type { Server as HttpServer } from "http";
import { Server, type Socket } from "socket.io";
import { config } from "../config";
import { verifyAccessToken } from "./jwt";
import { ACCESS_COOKIE } from "./auth-cookies";
import { prisma } from "./prisma";
import { requireProjectAccess } from "./authz";

let io: Server | null = null;

function parseCookies(header: string): Record<string, string> {
  return header.split(";").reduce((acc, pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return acc;
    const key = pair.slice(0, idx).trim();
    const value = decodeURIComponent(pair.slice(idx + 1).trim());
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
}

const corsOrigin = config.clientOrigin.filter((origin): origin is string => Boolean(origin));

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
       cors: { origin: corsOrigin, credentials: true },

  });

  io.use((socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      const token = rawCookie ? parseCookies(rawCookie)[ACCESS_COOKIE] : undefined;
      if (!token) return next(new Error("Not authenticated"));
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error("Not authenticated"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;

    socket.on("join:issue", async (issueId: string) => {
      try {
        const issue = await prisma.issue.findUniqueOrThrow({
          where: { id: issueId },
          select: { projectId: true },
        });
        await requireProjectAccess(userId, issue.projectId);
        socket.join(`issue:${issueId}`);
      } catch {
        // no access, or issue no longer exists — the socket simply won't receive that room's events
      }
    });

    socket.on("leave:issue", (issueId: string) => {
      socket.leave(`issue:${issueId}`);
    });

    socket.on("join:project", async (projectId: string) => {
      try {
        await requireProjectAccess(userId, projectId);
        socket.join(`project:${projectId}`);
      } catch {
        // no access
      }
    });

    socket.on("leave:project", (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

/** Broadcast to a room if sockets are running; a silent no-op otherwise (e.g. when
 * deployed with sockets disabled) so REST endpoints never fail because of this. */
export function emitToRoom(room: string, event: string, payload: unknown): void {
  io?.to(room).emit(event, payload);
}
