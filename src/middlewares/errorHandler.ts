import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError.js";

// Turn a thrown error into an HTTP response.
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Zod failed. Tell the client which field is wrong.
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  // A known status, such as 404 or 409.
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // Anything else is an unexpected server error.
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
};
