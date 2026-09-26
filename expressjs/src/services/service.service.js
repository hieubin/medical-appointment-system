import { prisma } from "../models/index.js";

const serviceSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  durationMinutes: true,
  price: true,
  specialty: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
};

function serializeService(service) {
  return {
    ...service,
    price: service.price.toString(),
  };
}

export function getActiveServices({ specialtyId } = {}) {
  return prisma.service
    .findMany({
      where: {
        status: "ACTIVE",
        ...(specialtyId ? { specialtyId } : {}),
        ...(specialtyId ? { specialty: { status: "ACTIVE" } } : {}),
      },
      orderBy: { name: "asc" },
      select: serviceSelect,
    })
    .then((services) => services.map(serializeService));
}

export { serviceSelect, serializeService };