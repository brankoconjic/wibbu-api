import { PrismaClient } from '@prisma/client';

// Create a singleton instance of Prisma
const prisma = new PrismaClient();

// Export the singleton instance of Prisma
export default prisma;
