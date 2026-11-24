BEGIN;

ALTER TABLE produtos
  ADD COLUMN IF NOT EXISTS quantidade_minima INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'produtos_quantidade_minima_check'
      AND conrelid = 'produtos'::regclass
  ) THEN
    ALTER TABLE produtos
      ADD CONSTRAINT produtos_quantidade_minima_check
      CHECK (quantidade_minima >= 0);
  END IF;
END $$;

COMMIT;
