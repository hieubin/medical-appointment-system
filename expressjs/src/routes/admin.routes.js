import { Router } from "express";
import * as controller from "../controllers/admin.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  doctorBodySchema,
  adminAppointmentQuerySchema,
  resourceIdSchema,
  scheduleBodySchema,
  serviceBodySchema,
  specialtyBodySchema,
  statisticsQuerySchema,
  statusBodySchema,
} from "../schemas/admin.schema.js";
import { z } from "zod";

const scheduleParamsSchema = z.object({ id: z.string().uuid() });
const scheduleIdParamsSchema = z.object({ id: z.string().uuid(), scheduleId: z.string().uuid() });

export const adminRouter = Router();

adminRouter.route("/specialties")
  .get(controller.listSpecialties)
  .post(validate({ body: specialtyBodySchema }), controller.createSpecialty);
adminRouter.put("/specialties/:id", validate({ params: resourceIdSchema, body: specialtyBodySchema }), controller.updateSpecialty);
adminRouter.delete("/specialties/:id", validate({ params: resourceIdSchema }), controller.deleteSpecialty);

adminRouter.route("/doctors")
  .get(controller.listDoctors)
  .post(validate({ body: doctorBodySchema }), controller.createDoctor);
adminRouter.put("/doctors/:id", validate({ params: resourceIdSchema, body: doctorBodySchema }), controller.updateDoctor);
adminRouter.delete("/doctors/:id", validate({ params: resourceIdSchema }), controller.deleteDoctor);

adminRouter.route("/services")
  .get(controller.listServices)
  .post(validate({ body: serviceBodySchema }), controller.createService);
adminRouter.put("/services/:id", validate({ params: resourceIdSchema, body: serviceBodySchema }), controller.updateService);
adminRouter.delete("/services/:id", validate({ params: resourceIdSchema }), controller.deleteService);

adminRouter.route("/doctors/:id/schedules")
  .get(validate({ params: scheduleParamsSchema }), controller.listSchedules)
  .post(validate({ params: scheduleParamsSchema, body: scheduleBodySchema }), controller.createSchedule);
adminRouter.put("/doctors/:id/schedules/:scheduleId", validate({ params: scheduleIdParamsSchema, body: scheduleBodySchema }), (req, res, next) => {
  req.validated.scheduleId = req.validated.params.scheduleId;
  return controller.updateSchedule(req, res, next);
});
adminRouter.delete("/doctors/:id/schedules/:scheduleId", validate({ params: scheduleIdParamsSchema }), (req, res, next) => {
  req.validated.scheduleId = req.validated.params.scheduleId;
  return controller.deleteSchedule(req, res, next);
});

adminRouter.get("/appointments", validate({ query: adminAppointmentQuerySchema }), controller.listAppointments);
adminRouter.patch("/appointments/:id/status", validate({ params: resourceIdSchema, body: statusBodySchema }), controller.changeAppointmentStatus);
adminRouter.get("/statistics/appointments", validate({ query: statisticsQuerySchema }), controller.appointmentStatistics);