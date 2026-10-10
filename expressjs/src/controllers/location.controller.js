import { success } from "../views/json.view.js";

export const CLINIC_LOCATIONS = [
  {
    id: "loc-q5",
    name: "Phòng khám Tâm An - Quận 5",
    shortName: "Cơ sở Quận 5 (Trụ sở chính)",
    address: "123 Nguyễn Văn Cừ, Phường 4, Quận 5",
    city: "TP. Hồ Chí Minh",
    fullAddress: "123 Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh",
    hotline: "1900 1234 (Nhánh 1)",
    phone: "028 3835 1234",
    rooms: ["Phòng khám 101", "Phòng khám 102", "Phòng khám 103"],
  },
  {
    id: "loc-bt",
    name: "Phòng khám Tâm An - Bình Thạnh",
    shortName: "Cơ sở Bình Thạnh",
    address: "456 Điện Biên Phủ, Phường 25, Quận Bình Thạnh",
    city: "TP. Hồ Chí Minh",
    fullAddress: "456 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh",
    hotline: "1900 1234 (Nhánh 2)",
    phone: "028 3512 8888",
    rooms: ["Phòng khám 201", "Phòng khám 202"],
  },
  {
    id: "loc-td",
    name: "Phòng khám Tâm An - TP. Thủ Đức",
    shortName: "Cơ sở Thủ Đức",
    address: "88 Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức",
    city: "TP. Hồ Chí Minh",
    fullAddress: "88 Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh",
    hotline: "1900 1234 (Nhánh 3)",
    phone: "028 3722 5555",
    rooms: ["Phòng khám 105", "Phòng khám 106"],
  },
  {
    id: "loc-cg",
    name: "Phòng khám Tâm An - Cầu Giấy (Hà Nội)",
    shortName: "Cơ sở Cầu Giấy",
    address: "78 Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy",
    city: "Hà Nội",
    fullAddress: "78 Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội",
    hotline: "1900 1234 (Nhánh 4)",
    phone: "024 3795 6666",
    rooms: ["Phòng khám HN-01", "Phòng khám HN-02"],
  },
];

export async function listLocations(_req, res) {
  return success(res, CLINIC_LOCATIONS);
}

export async function getLocation(req, res) {
  const loc = CLINIC_LOCATIONS.find((l) => l.id === req.params.id);
  if (!loc) {
    return res.status(404).json({ success: false, message: "Không tìm thấy cơ sở phòng khám." });
  }
  return success(res, loc);
}
