-- Add inventory and barcode support to products
ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "stock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "barcode" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Product_barcode_key" ON "Product"("barcode");
