import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { organization, twoFactor, admin } from "better-auth/plugins";
import { prisma } from "./db";

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

// During build phase, create a minimal auth object to avoid database initialization
export const auth = isBuildPhase 
  ? {
      api: {
        getSession: async () => null,
      },
      $Infer: {
        Session: {
          user: null,
          session: null,
        },
      },
    }
  : betterAuth({
      database: prismaAdapter(prisma, {
        provider: "postgresql",
      }),
      emailAndPassword: {
        enabled: true,
      },
      plugins: [organization(), twoFactor(), admin()],
    });
