import { HttpError } from "../utils/httpError.js";
import type { CarBody } from "../schemas/car.schema.js";
import {
  deleteCarById,
  findCarById,
  findCars,
  insertCar,
  updateCarById,
  type Car,
} from "../repositories/cars.repository.js";

// Turn a duplicate-plate database error into HTTP 409.
function throwIfDuplicatePlate(error: unknown): never {
  // Postgres code 23505 means the unique license plate already exists.
  if (isUniqueViolation(error)) {
    throw new HttpError(409, "License plate already exists");
  }

  // Any other error stays unchanged.
  throw error;
}

// Check if Postgres rejected a duplicate unique value.
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

// Return every car.
export async function listCars(): Promise<Car[]> {
  return findCars();
}

// Return one car, or 404 when the id is missing.
export async function getCar(id: number): Promise<Car> {
  // Load the row.
  const car = await findCarById(id);

  // Missing row becomes 404 for the client.
  if (!car) {
    throw new HttpError(404, "Car not found");
  }

  return car;
}

// Save a new car. A duplicate plate becomes 409.
export async function createCar(body: CarBody): Promise<Car> {
  try {
    return await insertCar(body);
  } catch (error) {
    throwIfDuplicatePlate(error);
  }
}

// Replace one car. Missing id is 404. Duplicate plate is 409.
export async function updateCar(id: number, body: CarBody): Promise<Car> {
  try {
    // Save the new fields.
    const car = await updateCarById(id, body);

    // The id was not in the table.
    if (!car) {
      throw new HttpError(404, "Car not found");
    }

    return car;
  } catch (error) {
    // Keep the 404. Do not treat it as a database failure.
    if (error instanceof HttpError) {
      throw error;
    }

    throwIfDuplicatePlate(error);
  }
}

// Delete one car. Missing id is 404.
export async function removeCar(id: number): Promise<void> {
  // Ask the database to delete the row.
  const deleted = await deleteCarById(id);

  if (!deleted) {
    throw new HttpError(404, "Car not found");
  }
}
