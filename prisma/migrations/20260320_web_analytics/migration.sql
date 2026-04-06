-- Web analytics tables for visits and reporting
CREATE TABLE IF NOT EXISTS "WebVisitorProfile" (
  "id" TEXT NOT NULL,
  "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "visitCount" INTEGER NOT NULL DEFAULT 0,
  "userEmail" TEXT,
  "userName" TEXT,
  "country" TEXT NOT NULL DEFAULT 'DESCONOCIDO',
  "city" TEXT NOT NULL DEFAULT 'DESCONOCIDA',
  "lastPath" TEXT,
  CONSTRAINT "WebVisitorProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "WebVisitEvent" (
  "id" TEXT NOT NULL,
  "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "path" TEXT NOT NULL,
  "country" TEXT NOT NULL DEFAULT 'DESCONOCIDO',
  "city" TEXT NOT NULL DEFAULT 'DESCONOCIDA',
  "visitorId" TEXT NOT NULL,
  "userEmail" TEXT,
  "userName" TEXT,
  CONSTRAINT "WebVisitEvent_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'WebVisitEvent_visitorId_fkey'
  ) THEN
    ALTER TABLE "WebVisitEvent"
    ADD CONSTRAINT "WebVisitEvent_visitorId_fkey"
    FOREIGN KEY ("visitorId") REFERENCES "WebVisitorProfile"("id")
    ON DELETE NO ACTION ON UPDATE NO ACTION;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "WebVisitEvent_visitedAt_idx" ON "WebVisitEvent"("visitedAt");
CREATE INDEX IF NOT EXISTS "WebVisitEvent_path_idx" ON "WebVisitEvent"("path");
CREATE INDEX IF NOT EXISTS "WebVisitEvent_country_idx" ON "WebVisitEvent"("country");
CREATE INDEX IF NOT EXISTS "WebVisitEvent_city_idx" ON "WebVisitEvent"("city");
CREATE INDEX IF NOT EXISTS "WebVisitEvent_visitorId_idx" ON "WebVisitEvent"("visitorId");
CREATE INDEX IF NOT EXISTS "WebVisitEvent_userEmail_idx" ON "WebVisitEvent"("userEmail");
CREATE INDEX IF NOT EXISTS "WebVisitorProfile_lastSeenAt_idx" ON "WebVisitorProfile"("lastSeenAt");
CREATE INDEX IF NOT EXISTS "WebVisitorProfile_visitCount_idx" ON "WebVisitorProfile"("visitCount");
CREATE INDEX IF NOT EXISTS "WebVisitorProfile_country_idx" ON "WebVisitorProfile"("country");
CREATE INDEX IF NOT EXISTS "WebVisitorProfile_city_idx" ON "WebVisitorProfile"("city");
CREATE INDEX IF NOT EXISTS "WebVisitorProfile_userEmail_idx" ON "WebVisitorProfile"("userEmail");
