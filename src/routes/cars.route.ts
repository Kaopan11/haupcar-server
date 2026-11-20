import { Router } from "express";
import {
  deleteCar,
  getCarById,
  getCars,
  postCar,
  putCar,
} from "../controllers/cars.controller.js";
import { validateBody, validateParams } from "../middlewares/validate.js";
import { carBodySchema, carIdParamsSchema } from "../schemas/car.schema.js";

export const carsRouter = Router();

// List does not need an id or a body.
carsRouter.get("/", getCars);

// Check the id before loading one car.
carsRouter.get("/:id", validateParams(carIdParamsSchema), getCarById);

// Check the body before creating a car.
carsRouter.post("/", validateBody(carBodySchema), postCar);

// Check the id and the body before updating a car.
carsRouter.put(
  "/:id",
  validateParams(carIdParamsSchema),
  validateBody(carBodySchema),
  putCar,
);

// Check the id before deleting a car.
carsRouter.delete("/:id", validateParams(carIdParamsSchema), deleteCar);
