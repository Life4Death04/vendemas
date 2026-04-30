import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaNeon }   from '@prisma/adapter-neon';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export const prisma = global.__prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') global.__prisma = prisma;
