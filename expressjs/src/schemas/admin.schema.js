import { z } from "zod";
import { dateSchema } from "./slot.schema.js";

const idSchema = z.string().uuid();
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const statusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const resourceIdSchema = z.object({ id: idSchema });

export const specialtyBodySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(1000).optional(),
  status: statusSchema.optional(),
});

export const doctorBodySchema = z.object({
  fullName: z.string().trim().min(2, "Họ và tên tối thiểu 2 ký tự").max(150),
  phone: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.string().trim().max(20).optional()),
  email: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.string().trim().email("Email không đúng định dạng").optional()),
  licenseNumber: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.string().trim().max(80).optional()),
  title: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.string().trim().max(100).optional()),
  bio: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.string().trim().max(2000).optional()),
  avatarUrl: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.string().trim().url("Đường dẫn ảnh đại diện không hợp lệ").optional()),
  status: statusSchema.optional(),
  specialtyIds: z.array(idSchema).min(1, "Vui lòng chọn ít nhất 1 chuyên khoa"),
});

export const serviceBodySchema = z.object({
  name: z.string().trim().min(2).max(150),
  slug: z.string().trim().min(2).max(150).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.string().trim().max(1000).optional()),
  durationMinutes: z.coerce.number().int().positive().max(480),
  price: z.union([z.string(), z.number()]).transform((value) => BigInt(value)),
  specialtyId: z.preprocess((val) => (val === "" || val === null ? undefined : val), idSchema.optional()),
  status: statusSchema.optional(),
});

export const scheduleBodySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: timeSchema,
  endTime: timeSchema,
  slotDurationMinutes: z.number().int().positive().max(240),
  effectiveFrom: dateSchema,
  effectiveTo: dateSchema.optional(),
  status: statusSchema.optional(),
}).refine((value) => value.startTime < value.endTime, {
  message: "Giờ kết thúc phải sau giờ bắt đầu.",
  path: ["endTime"],
});

export const adminAppointmentQuerySchema = z.object({
  date: dateSchema.optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  doctorId: idSchema.optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const statusBodySchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]),
  reason: z.string().trim().max(500).optional(),
});

export const statisticsQuerySchema = z.object({
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  groupBy: z.enum(["day", "week"]).default("day"),
  doctorId: idSchema.optional(),
  specialtyId: idSchema.optional(),
});