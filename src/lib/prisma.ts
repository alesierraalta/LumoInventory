import { PrismaClient } from '@prisma/client';

// Create mock implementations to prevent errors
const mockPrismaClient = {
  category: {
    findMany: async () => [],
    create: async (data: any) => data.data,
    findUnique: async () => null,
    update: async (data: any) => data.data,
    delete: async () => ({})
  },
  product: {
    findMany: async () => [],
    create: async (data: any) => data.data,
    findUnique: async () => null,
    update: async (data: any) => data.data,
    delete: async () => ({})
  },
  project: {
    findMany: async () => [],
    create: async (data: any) => data.data,
    findUnique: async () => null,
    update: async (data: any) => data.data,
    delete: async () => ({})
  },
  projectProduct: {
    findMany: async () => [],
    create: async (data: any) => data.data,
    findUnique: async () => null,
    update: async (data: any) => data.data,
    delete: async () => ({}),
    deleteMany: async () => ({})
  },
  importConfig: {
    findMany: async () => [],
    create: async (data: any) => data.data,
    findUnique: async () => null,
    update: async (data: any) => data.data,
    delete: async () => ({})
  }
};

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Usamos la URL optimizada para Prisma si está disponible
const databaseUrl = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

let prismaInstance;

try {
  prismaInstance =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaInstance;
} catch (error) {
  console.error('Failed to initialize Prisma client, using mock:', error);
  prismaInstance = mockPrismaClient as unknown as PrismaClient;
}

export const prisma = prismaInstance; 