import { prisma } from "../models/index.js";
import { success, fail } from "../views/json.view.js";

export async function getRecords(req, res) {
  try {
    const record = await prisma.medicalRecord.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    return success(res, record);
  } catch (error) {
    console.error("getRecords error:", error);
    return fail(res, "Không thể lấy hồ sơ sức khỏe", 500);
  }
}

export async function createRecord(req, res) {
  try {
    const record = await prisma.medicalRecord.create({
      data: {
        userId: req.user.id,
        ...req.body,
      },
    });
    return success(res, record, 201);
  } catch (error) {
    console.error("createRecord error:", error);
    return fail(res, "Không thể tạo hồ sơ sức khỏe", 500);
  }
}

export async function updateRecord(req, res) {
  try {
    const record = await prisma.medicalRecord.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!record) {
      return fail(res, "Không tìm thấy hồ sơ", 404);
    }

    const updated = await prisma.medicalRecord.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return success(res, updated);
  } catch (error) {
    console.error("updateRecord error:", error);
    return fail(res, "Không thể cập nhật hồ sơ", 500);
  }
}
