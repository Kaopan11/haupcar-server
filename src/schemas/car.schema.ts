import { z } from "zod";

// "ab 12-34" and "AB1234" must become the same plate before we check the length.
const licensePlateSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, "").toUpperCase())
  .pipe(z.string().min(1).max(20));

// Trim text, reject a blank value, and limit the length.
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

// The id in the URL must be a whole number greater than 0.
export const carIdParamsSchema = z.object({
  id: z.string().regex(/^[1-9]\d*$/),
});

// The create and update body. Extra fields are rejected.
export const carBodySchema = z
  .object({
    licensePlate: licensePlateSchema,
    brand: requiredTextSchema(50),
    model: requiredTextSchema(50),
    notes: notesSchema,
  })
  .strict();

export type CarBody = z.infer<typeof carBodySchema>;
