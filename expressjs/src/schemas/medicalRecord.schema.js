import { z } from "zod";

export const medicalRecordSchema = z.object({
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  bloodPressure: z.string().optional(),
  heartRate: z.number().int().positive().optional(),
  temperature: z.number().positive().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  notes: z.string().optional(),
});

export const medicalRecordUpdateSchema = medicalRecordSchema.partial();
