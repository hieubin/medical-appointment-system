import { Router } from "express";
import {
  cancel,
  create,
  lookup,
} from "../controllers/appointment.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  appointmentIdParamsSchema,
  cancelAppointmentSchema,
  createAppointmentSchema,
  lookupAppointmentSchema,
} from "../schemas/appointment.schema.js";

export const appointmentRouter = Router();

appointmentRouter.post("/", validate({ body: createAppointmentSchema }), create);
appointmentRouter.post("/lookup", validate({ body: lookupAppointmentSchema }), lookup);
appointmentRouter.post(
  "/:id/cancel",
  validate({ params: appointmentIdParamsSchema, body: cancelAppointmentSchema }),
  cancel,
);