import { prisma } from "../models/index.js";

export async function pingDatabase() {
  await prisma.$queryRaw`SELECT 1`;
  return { database: "up" };
}
