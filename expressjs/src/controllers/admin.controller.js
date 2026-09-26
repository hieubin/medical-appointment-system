import * as service from "../services/admin.service.js";
import * as appointmentService from "../services/admin-appointment.service.js";
import { fail, success } from "../views/json.view.js";

function handleNotFound(error, res) {
  if (error.code === "P2025") return fail(res, "Không tìm thấy dữ liệu.", 404);
  throw error;
}

export async function listSpecialties(_req, res) { return success(res, await service.listAdminSpecialties()); }
export async function createSpecialty(req, res) { try { return success(res, await service.createSpecialty(req.validated.body), 201); } catch (error) { return handleNotFound(error, res); } }
export async function updateSpecialty(req, res) { try { return success(res, await service.updateSpecialty(req.validated.params.id, req.validated.body)); } catch (error) { return handleNotFound(error, res); } }
export async function deleteSpecialty(req, res) { try { return success(res, await service.deactivateSpecialty(req.validated.params.id)); } catch (error) { return handleNotFound(error, res); } }

export async function listDoctors(_req, res) { return success(res, await service.listAdminDoctors()); }
export async function createDoctor(req, res) { try { return success(res, await service.createDoctor(req.validated.body), 201); } catch (error) { return handleNotFound(error, res); } }
export async function updateDoctor(req, res) { try { return success(res, await service.updateDoctor(req.validated.params.id, req.validated.body)); } catch (error) { return handleNotFound(error, res); } }
export async function deleteDoctor(req, res) { try { return success(res, await service.deactivateDoctor(req.validated.params.id)); } catch (error) { return handleNotFound(error, res); } }

export async function listServices(_req, res) { return success(res, await service.listAdminServices()); }
export async function createService(req, res) { try { return success(res, await service.createService(req.validated.body), 201); } catch (error) { return handleNotFound(error, res); } }
export async function updateService(req, res) { try { return success(res, await service.updateService(req.validated.params.id, req.validated.body)); } catch (error) { return handleNotFound(error, res); } }
export async function deleteService(req, res) { try { return success(res, await service.deactivateService(req.validated.params.id)); } catch (error) { return handleNotFound(error, res); } }

export async function listSchedules(req, res) { try { return success(res, await service.listSchedules(req.validated.params.id)); } catch (error) { return handleNotFound(error, res); } }
export async function createSchedule(req, res) { try { return success(res, await service.createSchedule(req.validated.params.id, req.validated.body), 201); } catch (error) { return handleNotFound(error, res); } }
export async function updateSchedule(req, res) { try { return success(res, await service.updateSchedule(req.validated.scheduleId, req.validated.body)); } catch (error) { return handleNotFound(error, res); } }
export async function deleteSchedule(req, res) { try { return success(res, await service.deactivateSchedule(req.validated.scheduleId)); } catch (error) { return handleNotFound(error, res); } }

export async function listAppointments(req, res) {
  return success(res, await appointmentService.listAppointments(req.validated.query));
}

export async function changeAppointmentStatus(req, res) {
  try {
    return success(res, await appointmentService.changeAppointmentStatus(req.validated.params.id, req.validated.body.status, req.validated.body.reason));
  } catch (error) {
    return handleNotFound(error, res);
  }
}

export async function appointmentStatistics(req, res) {
  return success(res, await appointmentService.appointmentStatistics(req.validated.query));
}