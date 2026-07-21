import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function globalErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.issues,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: `Duplicate value for: ${(err.meta?.target as string[])?.join(", ")}`,
      });
    }
  }

  console.error(err);
  const message = err instanceof Error ? err.message : "Something went wrong";
  res.status(500).json({ success: false, message });
}
