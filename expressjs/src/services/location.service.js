import { prisma } from "../models/index.js";

export const INITIAL_CLINIC_LOCATIONS = [
  {
    id: "loc-hn",
    name: "Phòng khám Đa khoa Hiếu Hải - Hà Nội",
    shortName: "Cơ sở Hà Nội (Trụ sở chính)",
    address: "152 Trần Phú, Q. Hà Đông, Hà Nội",
    fullAddress: "152 Trần Phú, Phường Văn Quán, Quận Hà Đông, Hà Nội",
    city: "Hà Nội",
    phone: "024 3351 1234",
    hotline: "1900 1234 (Nhánh 1)",
    status: "ACTIVE",
  },
  {
    id: "loc-nb",
    name: "Phòng khám Đa khoa Hiếu Hải - Ninh Bình",
    shortName: "Cơ sở Ninh Bình",
    address: "56 Trần Hưng Đạo, TP. Ninh Bình",
    fullAddress: "56 Trần Hưng Đạo, Phường Đinh Tiên Hoàng, TP. Ninh Bình, Ninh Bình",
    city: "Ninh Bình",
    phone: "0229 3871 555",
    hotline: "1900 1234 (Nhánh 2)",
    status: "ACTIVE",
  },
  {
    id: "loc-nd",
    name: "Phòng khám Đa khoa Hiếu Hải - Nam Định",
    shortName: "Cơ sở Nam Định",
    address: "89 Trần Hưng Đạo, TP. Nam Định",
    fullAddress: "89 Trần Hưng Đạo, Phường Ngô Quyền, TP. Nam Định, Nam Định",
    city: "Nam Định",
    phone: "0228 3849 888",
    hotline: "1900 1234 (Nhánh 3)",
    status: "ACTIVE",
  },
  {
    id: "loc-ls",
    name: "Phòng khám Đa khoa Hiếu Hải - Lạng Sơn",
    shortName: "Cơ sở Lạng Sơn",
    address: "45 Lê Lợi, TP. Lạng Sơn",
    fullAddress: "45 Lê Lợi, Phường Chi Lăng, TP. Lạng Sơn, Lạng Sơn",
    city: "Lạng Sơn",
    phone: "0205 3870 666",
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
