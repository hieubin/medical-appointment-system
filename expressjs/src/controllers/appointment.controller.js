import {
  cancelAppointment,
  createAppointment,
  getMyAppointments,
  lookupAppointment,
} from "../services/appointment.service.js";
import { fail, success } from "../views/json.view.js";

export async function getMy(req, res) {
  const user = req.auth?.user || req.user;
  if (!user) return fail(res, "Cần đăng nhập để tiếp tục.", 401);
  return success(res, await getMyAppointments(user));
}

export async function create(req, res) {
  const input = {
    ...req.validated.body,
    patientId: req.auth?.user?.id || req.user?.id || req.validated.body.patientId,
  };
  return success(res, await createAppointment(input), 201);
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