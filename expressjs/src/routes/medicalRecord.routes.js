import { Router } from "express";
import { getRecords, createRecord, updateRecord } from "../controllers/medicalRecord.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { medicalRecordSchema, medicalRecordUpdateSchema } from "../schemas/medicalRecord.schema.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

export const medicalRecordRouter = Router();

medicalRecordRouter.get("/", requireAuth, getRecords);
medicalRecordRouter.post("/", requireAuth, validate({ body: medicalRecordSchema }), createRecord);
medicalRecordRouter.patch("/:id", requireAuth, validate({ body: medicalRecordUpdateSchema }), updateRecord);
