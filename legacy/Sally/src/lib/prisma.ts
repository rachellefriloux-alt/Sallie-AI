import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null };

function createPrismaClient(): PrismaClient | null {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes('localhost:5432')) {
    console.warn('[prisma] DATABASE_URL not configured or points to localhost — Prisma disabled');
    return null;
  }
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  } catch (e) {
    console.error('[prisma] Failed to create PrismaClient:', e);
    return null;
  }
}

const client = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;

const noopProxy = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (prop === '$connect' || prop === '$disconnect') return async () => {};
    if (prop === 'then') return undefined;
    return new Proxy(() => {}, {
      get() {
        return () => Promise.resolve(null);
      },
      apply() {
        return Promise.resolve(null);
      },
    });
  },
});

export const prisma: PrismaClient = client ?? noopProxy;
