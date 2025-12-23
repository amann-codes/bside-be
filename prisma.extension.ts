import { PrismaClient } from '@prisma/client';
import pagination from 'prisma-extension-pagination';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,

});
export const extendedPrismaClient =  new PrismaClient({ adapter }).$extends(pagination());

export type ExtendedPrismaClient = typeof extendedPrismaClient;

export function createPrismaClient(databaseUrl: string) {
  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });

  return new PrismaClient({ adapter }).$extends(pagination());
}
