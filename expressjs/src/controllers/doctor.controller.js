import {
  getActiveDoctorById,
  getActiveDoctors,
} from "../services/doctor.service.js";
import { getAvailableSlots } from "../services/slot.service.js";
import { fail, success } from "../views/json.view.js";

export async function listDoctors(req, res) {
  const doctors = await getActiveDoctors(req.validated.query);
  return success(res, doctors);
}

export async function getDoctor(req, res) {
  const doctor = await getActiveDoctorById(req.params.id);

  if (!doctor) {
    return fail(res, "Không tìm thấy bác sĩ đang hoạt động.", 404);
  }

  return success(res, doctor);
}

export async function listAvailableSlots(req, res) {
  const slots = await getAvailableSlots(
    req.validated.params.id,
    req.validated.query.date,
  );

  if (slots === null) {
    return fail(res, "Không tìm thấy bác sĩ đang hoạt động.", 404);
  }

  return success(res, slots);
}