import { Router } from "express";
import {
	getDoctor,
	listAvailableSlots,
	listDoctors,
} from "../controllers/doctor.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { doctorQuerySchema } from "../schemas/doctor.schema.js";
import { slotParamsSchema, slotQuerySchema } from "../schemas/slot.schema.js";

export const doctorRouter = Router();

doctorRouter.get("/", validate({ query: doctorQuerySchema }), listDoctors);
doctorRouter.get(
	"/:id/available-slots",
	validate({ params: slotParamsSchema, query: slotQuerySchema }),
	listAvailableSlots,
);
doctorRouter.get("/:id", getDoctor);