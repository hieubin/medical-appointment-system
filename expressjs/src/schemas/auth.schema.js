import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(200),
});

export const registerBodySchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(200),
  firstName: z.string().trim().min(1, "Vui lòng nhập họ").max(80),
  lastName: z.string().trim().min(1, "Vui lòng nhập tên").max(80),
  phone: z.string().trim().min(8, "Số điện thoại chưa hợp lệ").max(20),
});