-- Add gallery images field to products
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "images" JSONB;

-- Backfill existing products with their primary image so gallery always has at least one item
UPDATE "Product"
SET "images" = CASE
  WHEN COALESCE(TRIM("image"), '') <> '' THEN jsonb_build_array("image")
  ELSE '[]'::jsonb
END
WHERE "images" IS NULL;
