import { z } from "zod";

export const healthQuerySchema = z
  .object({
    verbose: z.enum(["0", "1"]).optional(),
  })
  .strict();
