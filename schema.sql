CREATE TABLE cars (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  license_plate VARCHAR(20)  NOT NULL,
  brand         VARCHAR(50)  NOT NULL,
  model         VARCHAR(50)  NOT NULL,
  notes         VARCHAR(500),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT cars_license_plate_not_blank
    CHECK (length(trim(license_plate)) > 0),
  CONSTRAINT cars_brand_not_blank
    CHECK (length(trim(brand)) > 0),
  CONSTRAINT cars_model_not_blank
    CHECK (length(trim(model)) > 0),
  CONSTRAINT cars_license_plate_unique
    UNIQUE (license_plate)
);

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