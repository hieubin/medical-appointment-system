import {
  cancelAppointment,
  createAppointment,
  lookupAppointment,
} from "../services/appointment.service.js";
import { fail, success } from "../views/json.view.js";

export async function create(req, res) {
  return success(res, await createAppointment(req.validated.body), 201);
}

export async function lookup(req, res) {
  const appointment = await lookupAppointment(req.validated.body);
  if (!appointment) return fail(res, "Không tìm thấy lịch hẹn.", 404);
  return success(res, appointment);
}

export async function cancel(req, res) {
  return success(
    res,
    await cancelAppointment(req.validated.params.id, req.validated.body),
  );
}