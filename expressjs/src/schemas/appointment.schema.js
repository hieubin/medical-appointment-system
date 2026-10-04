import { z } from "zod";
import { dateSchema } from "./slot.schema.js";

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid().optional(),
  patientName: z.string().trim().min(2).max(100),
  patientPhone: z.string().trim().min(8).max(20),
  patientEmail: z.string().trim().email().optional().or(z.literal("")),
  doctorId: z.string().uuid(),
  specialtyId: z.string().uuid().optional(),
  serviceId: z.string().uuid(),
  appointmentDate: dateSchema,
  startTime: timeSchema,
  patientNote: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const lookupAppointmentSchema = z.object({
  bookingCode: z.string().trim().min(6).max(30),
  patientPhone: z.string().trim().min(8).max(20),
});

export const cancelAppointmentSchema = z.object({
  patientPhone: z.string().trim().min(8).max(20),
  cancelReason: z.string().trim().max(500).optional(),
});

export const appointmentIdParamsSchema = z.object({
  id: z.string().uuid(),
});