import { prisma } from "../models/index.js";

export function getActiveSpecialties() {
  return prisma.specialty.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
  });
}

export function getActiveSpecialtyById(id) {
  return prisma.specialty.findFirst({
    where: {
      id,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      doctors: {
        where: {
          doctor: { status: "ACTIVE" },
        },
        orderBy: {
          doctor: { fullName: "asc" },
        },
        select: {
          doctor: {
            select: {
              id: true,
              fullName: true,
              title: true,
              bio: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  }).then((specialty) => {
    if (!specialty) return null;

    return {
      ...specialty,
      doctors: specialty.doctors.map(({ doctor }) => doctor),
    };
  });
}