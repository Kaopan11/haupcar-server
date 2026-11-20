import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError.js";

// Check if Postgres rejected a duplicate unique value.
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

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

  // A known status, such as 404.
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // Duplicate license plate from the unique constraint.
  if (isUniqueViolation(err)) {
    res.status(409).json({ message: "License plate already exists" });
    return;
  }

  // Anything else is an unexpected server error.
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
};
