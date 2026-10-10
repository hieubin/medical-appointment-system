import { prisma } from "../models/index.js";

const specialtySelect = { id: true, name: true, slug: true, description: true, status: true };
const doctorSelect = {
  id: true, fullName: true, phone: true, email: true, licenseNumber: true,
  title: true, bio: true, avatarUrl: true, status: true,
  specialties: { select: { specialty: { select: { id: true, name: true, slug: true } } } },
};

function flattenDoctor(doctor) {
  return { ...doctor, specialties: doctor.specialties.map(({ specialty }) => specialty) };
}

function serializeService(service) {
  return { ...service, price: service.price.toString() };
}

export function listAdminSpecialties() {
  return prisma.specialty.findMany({ orderBy: { name: "asc" }, select: specialtySelect });
}

export function createSpecialty(data) {
  return prisma.specialty.create({ data, select: specialtySelect });
}

export function updateSpecialty(id, data) {
  return prisma.specialty.update({ where: { id }, data, select: specialtySelect });
}

export function deactivateSpecialty(id) {
  return updateSpecialty(id, { status: "INACTIVE" });
}

export function listAdminDoctors() {
  return prisma.doctor.findMany({ orderBy: { fullName: "asc" }, select: doctorSelect }).then((doctors) => doctors.map(flattenDoctor));
}

function doctorData(data) {
  const { specialtyIds, ...doctor } = data;
  const cleanedDoctor = { ...doctor };
  for (const key of ["phone", "email", "licenseNumber", "title", "bio", "avatarUrl"]) {
    if (cleanedDoctor[key] === "" || cleanedDoctor[key] === undefined) {
      cleanedDoctor[key] = null;
    }
  }
  return { doctor: cleanedDoctor, specialtyIds: specialtyIds || [] };
}

export async function createDoctor(data) {
  const { doctor, specialtyIds } = doctorData(data);
  return prisma.$transaction(async (tx) => {
    if (specialtyIds.length > 0) {
      const specialties = await tx.specialty.count({ where: { id: { in: specialtyIds }, status: "ACTIVE" } });
      if (specialties !== new Set(specialtyIds).size) throw Object.assign(new Error("Chuyên khoa không hợp lệ."), { status: 422 });
    }
    const created = await tx.doctor.create({
      data: {
        ...doctor,
        specialties: specialtyIds.length > 0 ? { create: specialtyIds.map((specialtyId) => ({ specialtyId })) } : undefined,
      },
      select: doctorSelect,
    });
    return flattenDoctor(created);
  });
}

export async function updateDoctor(id, data) {
  const { doctor, specialtyIds } = doctorData(data);
  return prisma.$transaction(async (tx) => {
    if (specialtyIds.length > 0) {
      const specialties = await tx.specialty.count({ where: { id: { in: specialtyIds }, status: "ACTIVE" } });
      if (specialties !== new Set(specialtyIds).size) throw Object.assign(new Error("Chuyên khoa không hợp lệ."), { status: 422 });
      await tx.doctorSpecialty.deleteMany({ where: { doctorId: id } });
      for (const specialtyId of specialtyIds) {
        await tx.doctorSpecialty.create({ data: { doctorId: id, specialtyId } });
      }
    }
    const updated = await tx.doctor.update({
      where: { id },
      data: doctor,
      select: doctorSelect,
    });
    return flattenDoctor(updated);
  });
}

export async function deleteDoctor(id) {
  const appointmentCount = await prisma.appointment.count({ where: { doctorId: id } });
  if (appointmentCount > 0) {
    return prisma.doctor.update({ where: { id }, data: { status: "INACTIVE" }, select: doctorSelect }).then(flattenDoctor);
  }
  await prisma.workingSchedule.deleteMany({ where: { doctorId: id } });
  await prisma.scheduleException.deleteMany({ where: { doctorId: id } });
  await prisma.doctorSpecialty.deleteMany({ where: { doctorId: id } });
  return prisma.doctor.delete({ where: { id }, select: doctorSelect }).then(flattenDoctor);
}

export function deactivateDoctor(id) {
  return deleteDoctor(id);
}

export function listAdminServices() {
  return prisma.service.findMany({ orderBy: { name: "asc" }, include: { specialty: { select: { id: true, name: true, slug: true } } } }).then((services) => services.map(serializeService));
}

export function createService(data) {
  return prisma.service.create({ data, include: { specialty: { select: { id: true, name: true, slug: true } } } }).then(serializeService);
}

export function updateService(id, data) {
  return prisma.service.update({ where: { id }, data, include: { specialty: { select: { id: true, name: true, slug: true } } } }).then(serializeService);
}

export function deactivateService(id) {
  return updateService(id, { status: "INACTIVE" });
}

export function listSchedules(doctorId) {
  return prisma.workingSchedule.findMany({ where: { doctorId }, orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] });
}

export async function createSchedule(doctorId, data) {
  const { effectiveFrom, effectiveTo, ...schedule } = data;
  if (effectiveTo && effectiveTo < effectiveFrom) throw Object.assign(new Error("effectiveTo phải sau effectiveFrom."), { status: 422 });
  return prisma.workingSchedule.create({ data: { doctorId, ...schedule, effectiveFrom: new Date(`${effectiveFrom}T00:00:00.000Z`), effectiveTo: effectiveTo ? new Date(`${effectiveTo}T00:00:00.000Z`) : null } });
}

export function updateSchedule(id, data) {
  const { effectiveFrom, effectiveTo, ...schedule } = data;
  return prisma.workingSchedule.update({ where: { id }, data: { ...schedule, ...(effectiveFrom ? { effectiveFrom: new Date(`${effectiveFrom}T00:00:00.000Z`) } : {}), ...(effectiveTo ? { effectiveTo: new Date(`${effectiveTo}T00:00:00.000Z`) } : {}) } });
}

export function deactivateSchedule(id) {
  return updateSchedule(id, { status: "INACTIVE" });
}