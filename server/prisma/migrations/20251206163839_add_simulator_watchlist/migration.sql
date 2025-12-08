-- CreateTable
CREATE TABLE "SimulatorWatchlist" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "priceAlertTarget" DECIMAL(65,30),
    "priceAlertEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SimulatorWatchlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SimulatorWatchlist_profileId_assetId_key" ON "SimulatorWatchlist"("profileId", "assetId");

-- AddForeignKey
ALTER TABLE "SimulatorWatchlist" ADD CONSTRAINT "SimulatorWatchlist_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "SimulatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulatorWatchlist" ADD CONSTRAINT "SimulatorWatchlist_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
