import { z } from "zod";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày phải có định dạng YYYY-MM-DD.")
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)), {
    message: "Ngày không hợp lệ.",
  });

export const slotParamsSchema = z.object({
  id: z.string().uuid(),
});

export const slotQuerySchema = z.object({
  date: dateSchema,
});

export { dateSchema };