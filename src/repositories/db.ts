import "dotenv/config";
import { Pool } from "pg";

// Read the connection string from .env.
// Example: DATABASE_URL=postgresql://postgres:password@host:5432/postgres
const connectionString = process.env.DATABASE_URL;

// Stop here if the value is missing, so we do not fail later on the first query.
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Pool keeps a few database connections open and reuses them.
// Supabase requires SSL, so ssl is turned on.
export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
