import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { pool } from "../src/repositories/db.js";

// Close the database pool so Vitest can exit.
afterAll(async () => {
  await pool.end();
});

describe("cars API", () => {
  // POST /api/cars returns 201 and the saved car.
  it("creates a car", async () => {
    const licensePlate = uniquePlate("CREATE");

    const response = await request(app).post("/api/cars").send({
      licensePlate,
      brand: "Toyota",
      model: "Yaris",
      notes: "test car",
    });

    expect(response.status).toBe(201);
    expect(response.body.licensePlate).toBe(licensePlate);
    expect(response.body.brand).toBe("Toyota");
    expect(response.body.model).toBe("Yaris");
    expect(response.body.notes).toBe("test car");
    expect(response.body.id).toBeTypeOf("number");

    await request(app).delete(`/api/cars/${response.body.id}`);
  });

  // POST /api/cars returns 409 when the plate already exists.
  it("rejects a duplicate license plate", async () => {
    const licensePlate = uniquePlate("DUP");

    const created = await request(app).post("/api/cars").send({
      licensePlate,
      brand: "Honda",
      model: "City",
    });

    const response = await request(app).post("/api/cars").send({
      licensePlate,
      brand: "Honda",
      model: "Civic",
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("License plate already exists");

    await request(app).delete(`/api/cars/${created.body.id}`);
  });

  // POST /api/cars returns 400 when the body is invalid.
  it("rejects an invalid body", async () => {
    const response = await request(app).post("/api/cars").send({
      licensePlate: "AB1234",
      brand: "",
      model: "Yaris",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  // GET /api/cars/:id returns 404 when the id is missing.
  it("returns 404 when the car does not exist", async () => {
    const response = await request(app).get("/api/cars/999999999");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Car not found");
  });

  // DELETE /api/cars/:id returns 204 and then GET returns 404.
  it("deletes a car", async () => {
    const created = await request(app).post("/api/cars").send({
      licensePlate: uniquePlate("DEL"),
      brand: "Mazda",
      model: "2",
    });

    const response = await request(app).delete(`/api/cars/${created.body.id}`);

    expect(response.status).toBe(204);

    const missing = await request(app).get(`/api/cars/${created.body.id}`);
    expect(missing.status).toBe(404);
  });
});

// Build a short unique plate so tests do not clash.
function uniquePlate(prefix: string): string {
  return `${prefix}${Date.now()}`.slice(0, 20);
}
