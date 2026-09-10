ALTER TABLE `WebVisitEvent`
  ADD COLUMN `appMode` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `appEvent` VARCHAR(191) NULL;

ALTER TABLE `WebVisitorProfile`
  ADD COLUMN `appFirstSeenAt` DATETIME(3) NULL,
  ADD COLUMN `appLastSeenAt` DATETIME(3) NULL,
  ADD COLUMN `appOpenCount` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `appInstalledAt` DATETIME(3) NULL;

CREATE INDEX `WebVisitEvent_appMode_idx` ON `WebVisitEvent`(`appMode`);
CREATE INDEX `WebVisitEvent_appEvent_idx` ON `WebVisitEvent`(`appEvent`);
CREATE INDEX `WebVisitorProfile_appLastSeenAt_idx` ON `WebVisitorProfile`(`appLastSeenAt`);
CREATE INDEX `WebVisitorProfile_appInstalledAt_idx` ON `WebVisitorProfile`(`appInstalledAt`);
