import type { RequestHandler } from "express";
import type { ZodType } from "zod";

// Check req.body with a zod schema.
// On success, replace req.body with the cleaned values.
// On failure, pass the ZodError to the error handler.
export function validateBody(schema: ZodType): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(result.error);
      return;
    }

    req.body = result.data;
    next();
  };
}
