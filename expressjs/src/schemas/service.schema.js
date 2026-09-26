import { z } from "zod";

export const serviceQuerySchema = z
  .object({
    specialtyId: z.string().uuid().optional(),
  })
  .strict();