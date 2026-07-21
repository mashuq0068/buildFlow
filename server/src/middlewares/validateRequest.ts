import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

export const validateRequest =
  (schema: ZodTypeAny) => async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (err) {
      next(err);
    }
  };
