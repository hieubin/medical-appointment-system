import { prisma } from "../models/index.js";

function normalizeText(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

export async function getActiveDoctors({ search, specialtyId } = {}) {
  const where = {
    status: "ACTIVE",
    ...(specialtyId
      ? {
          specialties: {
            some: { specialtyId },
          },
        }
      : {}),
  };

  const doctors = await prisma.doctor.findMany({
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
  });

  const formatted = doctors.map(({ specialties, ...doctor }) => ({
    ...doctor,
    specialties: specialties.map(({ specialty }) => specialty),
  }));

  if (!search || !search.trim()) {
    return formatted;
  }

  const queryNorm = normalizeText(search);

  return formatted.filter((doc) => {
    const docName = normalizeText(doc.fullName);
    const docTitle = normalizeText(doc.title);
    const docBio = normalizeText(doc.bio);
    const specNames = doc.specialties.map((s) => normalizeText(s.name));
    const specSlugs = doc.specialties.map((s) => normalizeText(s.slug));

    if (docName.includes(queryNorm) || queryNorm.includes(docName)) return true;
    if (docTitle.includes(queryNorm)) return true;
    if (docBio.includes(queryNorm)) return true;

    if (
      specNames.some((sn) => sn.includes(queryNorm) || queryNorm.includes(sn)) ||
      specSlugs.some((ss) => ss.includes(queryNorm) || queryNorm.includes(ss))
    ) {
      return true;
    }

    return false;
  });
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