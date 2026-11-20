# HAUPCAR Car Server

Node.js API for company cars. The React app talks only to this API. This server talks to Supabase PostgreSQL with `pg`. It does not use `supabase-js`.

## Stack

- Node.js, Express, TypeScript
- zod, cors, dotenv, pg
- Vitest, Supertest

## Setup

1. Create a free Supabase project.
2. Open **SQL Editor**, paste `schema.sql`, and run it. This creates the `cars` table.
3. Copy the env file:

```bash
cp .env.example .env
```

4. Fill `.env`:

| Name | What to put |
| --- | --- |
| `DATABASE_URL` | Supabase **Project Settings → Database → Connection string (URI)** |
| `PORT` | `3000` |
| `CORS_ORIGIN` | `http://localhost:5173` if the client uses Vite |

If the database password contains `@`, write it as `%40` in the URI.

5. Install packages:

```bash
npm install
```

Do not commit `.env`.

## Run

```bash
npm run dev
```

Open [http://localhost:3000/health](http://localhost:3000/health). You should see `{ "status": "ok" }`.

Other commands:

```bash
npm test
npm run build
npm start
```

`npm start` needs `npm run build` first. It runs the files in `dist/`.

The tests call the real Supabase database from `DATABASE_URL`. They create cars with unique plates and delete them after.

## API

Base URL: `http://localhost:3000`

| Method | Path | Success | Errors |
| --- | --- | --- | --- |
| `GET` | `/health` | `200` | — |
| `GET` | `/api/cars` | `200` list | `500` |
| `GET` | `/api/cars/:id` | `200` one car | `400` bad id, `404` not found, `500` |
| `POST` | `/api/cars` | `201` created | `400` validation, `409` duplicate plate, `500` |
| `PUT` | `/api/cars/:id` | `200` updated | `400`, `404`, `409`, `500` |
| `DELETE` | `/api/cars/:id` | `204` no body | `400` bad id, `404` not found, `500` |

JSON fields are camelCase: `licensePlate`, `createdAt`, `updatedAt`.

### Body for POST and PUT

```json
{
  "licensePlate": "AB1234",
  "brand": "Toyota",
  "model": "Yaris",
  "notes": "Office car"
}
```

- `licensePlate`, `brand`, and `model` are required.
- `notes` is optional. `""` is stored as `null`.
- Extra fields are rejected.
- The plate is trimmed, spaces and dashes are removed, then it is uppercased. `ab-12 34` becomes `AB1234`.

### Example errors

`400` when a field is invalid:

```json
{
  "message": "Validation failed",
  "errors": [{ "field": "brand", "message": "Too small: expected string to have >=1 characters" }]
}
```

`409` when the plate already exists:

```json
{ "message": "License plate already exists" }
```

`404` when the id is not in the table:

```json
{ "message": "Car not found" }
```

## Extra features

- Layers: route → validate (zod) → controller → service → repository (SQL) → Postgres
- SQL uses `$1`, `$2` placeholders only
- Duplicate plates come from Postgres code `23505` and become HTTP `409`
- `updated_at` is set by a database trigger on every update
- `GET /health` does not touch the database

## Folder layout

```
src/routes          HTTP paths
src/controllers     status codes and JSON
src/services        404 when a car is missing
src/repositories    SQL
src/middlewares     zod checks and error mapping
src/schemas         car body and id rules
```
