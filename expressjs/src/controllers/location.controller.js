import * as service from "../services/location.service.js";
import { success, fail } from "../views/json.view.js";

export async function listLocations(_req, res) {
  try {
    const locations = await service.listPublicLocations();
    return success(res, locations);
  } catch (error) {
    console.error("Error listing locations:", error);
    return fail(res, "Không thể tải danh sách cơ sở.", 500);
  }
}

export async function getLocation(req, res) {
  try {
    const loc = await service.getLocationById(req.params.id);
    if (!loc) {
      return fail(res, "Không tìm thấy cơ sở phòng khám.", 404);
    }
    return success(res, loc);
  } catch (error) {
    console.error("Error getting location:", error);
    return fail(res, "Lỗi máy chủ.", 500);
  }
}

// Admin handlers
export async function listAdminLocations(_req, res) {
  try {
    const locations = await service.listAdminLocations();
    return success(res, locations);
  } catch (error) {
    console.error("Error listing admin locations:", error);
    return fail(res, "Không thể tải danh sách cơ sở.", 500);
  }
}

export async function createLocation(req, res) {
  try {
    const location = await service.createLocation(req.body);
    return success(res, location, 201);
  } catch (error) {
    console.error("Error creating location:", error);
    return fail(res, error.message || "Không thể tạo cơ sở.", 400);
  }
}

export async function updateLocation(req, res) {
  try {
    const location = await service.updateLocation(req.params.id, req.body);
    return success(res, location);
  } catch (error) {
    console.error("Error updating location:", error);
    return fail(res, error.message || "Không thể cập nhật cơ sở.", 400);
  }
}

export async function deleteLocation(req, res) {
  try {
    const location = await service.deleteLocation(req.params.id);
    return success(res, location);
  } catch (error) {
    console.error("Error deleting location:", error);
    return fail(res, error.message || "Không thể xóa cơ sở.", 400);
  }
}
