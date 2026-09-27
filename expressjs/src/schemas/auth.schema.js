import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(200),
});