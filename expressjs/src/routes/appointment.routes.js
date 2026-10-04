import { Router } from "express";
import {
  cancel,
  create,
  getMy,
  lookup,
} from "../controllers/appointment.controller.js";
import { authenticate, optionalAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  appointmentIdParamsSchema,
  cancelAppointmentSchema,
  createAppointmentSchema,
  lookupAppointmentSchema,
} from "../schemas/appointment.schema.js";

export const appointmentRouter = Router();

appointmentRouter.get("/my", authenticate, getMy);
appointmentRouter.post("/", optionalAuth, validate({ body: createAppointmentSchema }), create);
appointmentRouter.post("/lookup", validate({ body: lookupAppointmentSchema }), lookup);
appointmentRouter.post(
  "/:id/cancel",
  validate({ params: appointmentIdParamsSchema, body: cancelAppointmentSchema }),
  cancel,
);