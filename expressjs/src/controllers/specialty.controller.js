import {
  getActiveSpecialties,
  getActiveSpecialtyById,
} from "../services/specialty.service.js";
import { fail, success } from "../views/json.view.js";

export async function listSpecialties(_req, res) {
  const specialties = await getActiveSpecialties();
  return success(res, specialties);
}

export async function getSpecialty(req, res) {
  const specialty = await getActiveSpecialtyById(req.params.id);

  if (!specialty) {
    return fail(res, "Không tìm thấy chuyên khoa đang hoạt động.", 404);
  }

  return success(res, specialty);
}