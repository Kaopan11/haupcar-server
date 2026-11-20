import { z } from "zod";

// "ab 12-34" and "AB1234" must become the same plate before we check the length.
const licensePlateSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, "").toUpperCase())
  .pipe(z.string().min(1).max(20));

const requiredTextSchema = (maxLength: number) =>
  z.string().trim().min(1).max(maxLength);

// An empty note is stored as null. A missing note is also null.
const notesSchema = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((value) => {
    if (value === undefined || value === "") {
      return null;
    }
    return value;
  });

export const carBodySchema = z
  .object({
    licensePlate: licensePlateSchema,
    brand: requiredTextSchema(50),
    model: requiredTextSchema(50),
    notes: notesSchema,
  })
  .strict();

export type CarBody = z.infer<typeof carBodySchema>;
