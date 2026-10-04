import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(200),
});

export const registerBodySchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(200),
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  clinicName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});