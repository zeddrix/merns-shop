import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';

export const validateBody =
  <T extends z.ZodType>(schema: T) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(', ');
      res.status(400);
      next(new Error(message));
      return;
    }
    req.body = result.data;
    next();
  };
