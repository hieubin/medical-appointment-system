import { z } from "zod";

export const doctorQuerySchema = z
  .object({
    search: z.string().trim().min(1).max(100).optional(),
    specialtyId: z.string().uuid().optional(),
  })
  .strict();