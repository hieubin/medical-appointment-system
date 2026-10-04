import { Router } from "express";
import { getRecords, createRecord, updateRecord } from "../controllers/medicalRecord.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { medicalRecordSchema, medicalRecordUpdateSchema } from "../schemas/medicalRecord.schema.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const medicalRecordRouter = Router();

medicalRecordRouter.get("/", authenticate, getRecords);
medicalRecordRouter.post("/", authenticate, validate({ body: medicalRecordSchema }), createRecord);
medicalRecordRouter.patch("/:id", authenticate, validate({ body: medicalRecordUpdateSchema }), updateRecord);
