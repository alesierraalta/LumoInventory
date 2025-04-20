import { PrismaClient } from '@prisma/client';
 
declare global {
  // This prevents TypeScript errors when accessing the global object
  var prisma: PrismaClient | undefined;
} 