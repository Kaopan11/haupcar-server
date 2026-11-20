import type { RequestHandler } from "express";
import type { ZodType } from "zod";

// Check one part of the request, body or params.
function validateRequest(schema: ZodType, source: "body" | "params"): RequestHandler {
  return (req, res, next) => {
    // Run the zod schema.
    const result = schema.safeParse(req[source]);

    // A bad value goes to the error handler as 400.
    if (!result.success) {
      next(result.error);
      return;
    }

    // Keep the cleaned body for the controller.
    if (source === "body") {
      req.body = result.data;
      next();
      return;
    }

    // Keep the cleaned params, including the id string.
    req.params = result.data as typeof req.params;
    next();
  };
}

// Check the JSON body.
export function validateBody(schema: ZodType): RequestHandler {
  return validateRequest(schema, "body");
}

// Check the URL params, such as :id.
export function validateParams(schema: ZodType): RequestHandler {
  return validateRequest(schema, "params");
}
