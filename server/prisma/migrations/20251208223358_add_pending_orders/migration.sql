-- AlterTable
ALTER TABLE "SimulatorTransaction" ADD COLUMN     "pending" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "executedAt" DROP NOT NULL;
