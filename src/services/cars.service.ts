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

// Save a new car. A duplicate plate is handled by the error handler as 409.
export async function createCar(body: CarBody): Promise<Car> {
  return insertCar(body);
}

// Replace one car. Missing id is 404. Duplicate plate is 409.
export async function updateCar(id: number, body: CarBody): Promise<Car> {
  // Save the new fields.
  const car = await updateCarById(id, body);

  // The id was not in the table.
  if (!car) {
    throw new HttpError(404, "Car not found");
  }

  return car;
}

// Delete one car. Missing id is 404.
export async function removeCar(id: number): Promise<void> {
  // Ask the database to delete the row.
  const deleted = await deleteCarById(id);

  if (!deleted) {
    throw new HttpError(404, "Car not found");
  }
}
