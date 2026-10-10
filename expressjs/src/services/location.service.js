import { prisma } from "../models/index.js";

export const INITIAL_CLINIC_LOCATIONS = [
  {
    id: "loc-q5",
    name: "Phòng khám Đa khoa Hiếu Hải - Quận 5",
    shortName: "Cơ sở Quận 5 (Trụ sở chính)",
    address: "123 Nguyễn Văn Cừ, Q.5, TP.HCM",
    fullAddress: "123 Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh",
    city: "TP. Hồ Chí Minh",
    phone: "028 3835 1234",
    hotline: "1900 1234 (Nhánh 1)",
    status: "ACTIVE",
  },
  {
    id: "loc-bt",
    name: "Phòng khám Đa khoa Hiếu Hải - Bình Thạnh",
    shortName: "Cơ sở Bình Thạnh",
    address: "456 Điện Biên Phủ, Q. Bình Thạnh, TP.HCM",
    fullAddress: "456 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh",
    city: "TP. Hồ Chí Minh",
    phone: "028 3512 8888",
    hotline: "1900 1234 (Nhánh 2)",
    status: "ACTIVE",
  },
  {
    id: "loc-td",
    name: "Phòng khám Đa khoa Hiếu Hải - TP. Thủ Đức",
    shortName: "Cơ sở TP. Thủ Đức",
    address: "88 Võ Văn Ngân, TP. Thủ Đức, TP.HCM",
    fullAddress: "88 Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh",
    city: "TP. Hồ Chí Minh",
    phone: "028 3722 5555",
    hotline: "1900 1234 (Nhánh 3)",
    status: "ACTIVE",
  },
  {
    id: "loc-cg",
    name: "Phòng khám Đa khoa Hiếu Hải - Cầu Giấy (HN)",
    shortName: "Cơ sở Cầu Giấy (Hà Nội)",
    address: "78 Duy Tân, Cầu Giấy, Hà Nội",
    fullAddress: "78 Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội",
    city: "Hà Nội",
    phone: "024 3795 6666",
    hotline: "1900 1234 (Nhánh 4)",
    status: "ACTIVE",
  },
];

export async function ensureLocationsSeeded() {
  const count = await prisma.location.count();
  if (count === 0) {
    for (const loc of INITIAL_CLINIC_LOCATIONS) {
      await prisma.location.upsert({
        where: { id: loc.id },
        update: {},
        create: loc,
      });
    }
  }
}

export async function listPublicLocations() {
  await ensureLocationsSeeded();
  return prisma.location.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  });
}

export async function listAdminLocations() {
  await ensureLocationsSeeded();
  return prisma.location.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function getLocationById(id) {
  return prisma.location.findUnique({
    where: { id },
  });
}

export async function createLocation(data) {
  const cleaned = {
    ...data,
    fullAddress: data.fullAddress || data.address,
    phone: data.phone || null,
    hotline: data.hotline || null,
    status: data.status || "ACTIVE",
  };
  return prisma.location.create({ data: cleaned });
}

export async function updateLocation(id, data) {
  const cleaned = {
    ...data,
    fullAddress: data.fullAddress || data.address,
    phone: data.phone || null,
    hotline: data.hotline || null,
  };
  return prisma.location.update({
    where: { id },
    data: cleaned,
  });
}

export async function deleteLocation(id) {
  // Check if appointments or doctors use this location (soft delete / hard delete)
  return prisma.location.delete({
    where: { id },
  }).catch(() => {
    return prisma.location.update({
      where: { id },
      data: { status: "INACTIVE" },
    });
  });
}
