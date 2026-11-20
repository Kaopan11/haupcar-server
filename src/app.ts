import "dotenv/config";
import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.js";
import { carsRouter } from "./routes/cars.route.js";

// Create the app here, but do not open a port.
// Tests can import this app without starting the server.
const app = express();

// Allow the React app (http://localhost:5173) to call this API.
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({ origin: corsOrigin }));

// Turn JSON request bodies into a JavaScript object (req.body).
app.use(express.json());

// Simple check that the server is running. It does not touch the database.
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Car routes live under /api/cars.
app.use("/api/cars", carsRouter);

// This must stay after the routes so it can catch their errors.
app.use(errorHandler);

export { app };
