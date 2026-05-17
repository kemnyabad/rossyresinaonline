-- CreateTable Rifa
CREATE TABLE IF NOT EXISTS "Rifa" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "totalNumbers" INTEGER NOT NULL,
    "pricePerNumber" DECIMAL(10,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "rules" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Rifa_pkey" PRIMARY KEY ("id")
);

-- CreateTable RifaTicket
CREATE TABLE IF NOT EXISTS "RifaTicket" (
    "id" TEXT NOT NULL,
    "rifaId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "buyerName" TEXT,
    "buyerEmail" TEXT,
    "buyerPhone" TEXT,
    "paymentImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RifaTicket_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "RifaTicket_rifaId_fkey" FOREIGN KEY ("rifaId") REFERENCES "Rifa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Rifa_status_idx" ON "Rifa"("status");
CREATE INDEX "Rifa_startDate_idx" ON "Rifa"("startDate");
CREATE UNIQUE INDEX "RifaTicket_rifaId_number_key" ON "RifaTicket"("rifaId", "number");
CREATE INDEX "RifaTicket_rifaId_idx" ON "RifaTicket"("rifaId");
CREATE INDEX "RifaTicket_status_idx" ON "RifaTicket"("status");
