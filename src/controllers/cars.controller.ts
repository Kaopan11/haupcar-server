import type { RequestHandler } from "express";
import type { CarBody } from "../schemas/car.schema.js";
import {
  createCar,
  getCar,
  listCars,
  removeCar,
  updateCar,
} from "../services/cars.service.js";

// GET /api/cars
export const getCars: RequestHandler = async (req, res) => {
  // Load the list.
  const cars = await listCars();

  // Send the list.
  res.status(200).json(cars);
};

// GET /api/cars/:id
export const getCarById: RequestHandler = async (req, res) => {
  // The route already checked that id is a whole number.
  const car = await getCar(Number(req.params.id));

  res.status(200).json(car);
};

// POST /api/cars
export const postCar: RequestHandler = async (req, res) => {
  // Body was already cleaned by validateBody.
  const car = await createCar(req.body as CarBody);

  // 201 means the car was created.
  res.status(201).json(car);
};

// PUT /api/cars/:id
export const putCar: RequestHandler = async (req, res) => {
  const car = await updateCar(Number(req.params.id), req.body as CarBody);

  res.status(200).json(car);
};

// DELETE /api/cars/:id
export const deleteCar: RequestHandler = async (req, res) => {
  await removeCar(Number(req.params.id));

  // 204 means deleted, with no JSON body.
  res.status(204).send();
};
