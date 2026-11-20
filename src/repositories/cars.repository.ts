import type { CarBody } from "../schemas/car.schema.js";
import { pool } from "./db.js";

export type Car = {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type CarRow = Omit<Car, "id"> & {
  id: string;
};

// Quoted aliases keep camelCase in JSON. Postgres would lowercase them otherwise.
const carColumns = `
  id,
  license_plate AS "licensePlate",
  brand,
  model,
  notes,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

// Turn a database row into a car the API can send.
function toCar(row: CarRow): Car {
  // Postgres returns BIGINT as a string. The API uses a number.
  return {
    ...row,
    id: Number(row.id),
  };
}

// Read every car, oldest id first.
export async function findCars(): Promise<Car[]> {
  // Ask the database for all rows.
  const result = await pool.query<CarRow>(
    `SELECT ${carColumns} FROM cars ORDER BY id`,
  );

  // Change each row into a Car.
  return result.rows.map(toCar);
}

// Read one car by its id.
export async function findCarById(id: number): Promise<Car | null> {
  // Ask the database for that id.
  const result = await pool.query<CarRow>(
    `SELECT ${carColumns} FROM cars WHERE id = $1`,
    [id],
  );

  // No row means the car is not in the table.
  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return toCar(row);
}

// Save a new car and return the saved row.
export async function insertCar(body: CarBody): Promise<Car> {
  // Insert the four fields. The database fills id and the two times.
  const result = await pool.query<CarRow>(
    `INSERT INTO cars (license_plate, brand, model, notes)
     VALUES ($1, $2, $3, $4)
     RETURNING ${carColumns}`,
    [body.licensePlate, body.brand, body.model, body.notes],
  );

  return toCar(result.rows[0]!);
}

// Change one car and return the new row.
export async function updateCarById(id: number, body: CarBody): Promise<Car | null> {
  // Update the four fields. The trigger sets updated_at.
  const result = await pool.query<CarRow>(
    `UPDATE cars
     SET license_plate = $1, brand = $2, model = $3, notes = $4
     WHERE id = $5
     RETURNING ${carColumns}`,
    [body.licensePlate, body.brand, body.model, body.notes, id],
  );

  // No row means that id is not in the table.
  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return toCar(row);
}

// Delete one car. Return true only when a row was removed.
export async function deleteCarById(id: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM cars WHERE id = $1", [id]);

  // rowCount is 1 when the id existed.
  return result.rowCount === 1;
}
