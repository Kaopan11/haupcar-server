-- Table for company cars.
-- Run this once in the Supabase SQL Editor.
CREATE TABLE cars (
  -- The database creates this number. The API does not send an id.
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Plate must be filled in, max 20 characters, and cannot be only spaces.
  license_plate VARCHAR(20)  NOT NULL,

  -- Brand and model are required, max 50 characters.
  brand         VARCHAR(50)  NOT NULL,
  model         VARCHAR(50)  NOT NULL,

  -- Notes are optional, max 500 characters.
  notes         VARCHAR(500),

  -- Both times are filled automatically when a row is inserted.
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),

  -- NOT NULL still allows "" and "   ". These checks block blank text.
  CONSTRAINT cars_license_plate_not_blank
    CHECK (length(trim(license_plate)) > 0),
  CONSTRAINT cars_brand_not_blank
    CHECK (length(trim(brand)) > 0),
  CONSTRAINT cars_model_not_blank
    CHECK (length(trim(model)) > 0),

  -- Two cars cannot have the same plate.
  -- Postgres error 23505 from this rule becomes HTTP 409 later.
  CONSTRAINT cars_license_plate_unique
    UNIQUE (license_plate)
);

-- This function runs before every UPDATE and refreshes updated_at.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER cars_set_updated_at
BEFORE UPDATE ON cars
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
