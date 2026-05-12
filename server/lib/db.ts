import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    // Disable connection pooling/validation during build to avoid database errors
    ...(isBuildPhase && {
      errorFormat: "minimal",
    }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;