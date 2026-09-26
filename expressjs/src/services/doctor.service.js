import { prisma } from "../models/index.js";

export function getActiveDoctors({ search, specialtyId } = {}) {
  const where = {
    status: "ACTIVE",
    ...(search
      ? {
          fullName: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {}),
    ...(specialtyId
      ? {
          specialties: {
            some: { specialtyId },
          },
        }
      : {}),
  };

  return prisma.doctor.findMany({
    where,
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      title: true,
      bio: true,
      avatarUrl: true,
      specialties: {
        where: {
          specialty: { status: "ACTIVE" },
        },
        orderBy: {
          specialty: { name: "asc" },
        },
        select: {
          specialty: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  }).then((doctors) =>
    doctors.map(({ specialties, ...doctor }) => ({
      ...doctor,
      specialties: specialties.map(({ specialty }) => specialty),
    })),
  );
}

export function getActiveDoctorById(id) {
  return prisma.doctor
    .findFirst({
      where: { id, status: "ACTIVE" },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        licenseNumber: true,
        title: true,
        bio: true,
        avatarUrl: true,
        specialties: {
          where: { specialty: { status: "ACTIVE" } },
          orderBy: { specialty: { name: "asc" } },
          select: {
            specialty: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    })
    .then(async (doctor) => {
      if (!doctor) return null;

      const specialtyIds = doctor.specialties.map(
        ({ specialty }) => specialty.id,
      );
      const services = await prisma.service.findMany({
        where: {
          status: "ACTIVE",
          specialtyId: { in: specialtyIds },
        },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          durationMinutes: true,
          price: true,
          specialtyId: true,
        },
      });

      return {
        ...doctor,
        specialties: doctor.specialties.map(({ specialty }) => specialty),
        services: services.map((service) => ({
          ...service,
          price: service.price.toString(),
        })),
      };
    });
}