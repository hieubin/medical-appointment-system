import { prisma } from "../models/index.js";

const statuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];
const activeStatuses = ["PENDING", "CONFIRMED"];

function dateValue(date) {
  return new Date(`${date}T00:00:00.000Z`);
}

function buildWhere(query) {
  const where = {};
  if (query.date) where.appointmentDate = dateValue(query.date);
  if (query.from || query.to) {
    where.appointmentDate = {
      ...(query.from ? { gte: dateValue(query.from) } : {}),
      ...(query.to ? { lte: dateValue(query.to) } : {}),
    };
  }
  if (query.doctorId) where.doctorId = query.doctorId;
  if (query.status) where.status = query.status;
  if (query.search) {
    where.OR = [
      { bookingCode: { contains: query.search } },
      { patientName: { contains: query.search } },
      { patientPhone: { contains: query.search } },
    ];
  }
  return where;
}

const appointmentSelect = {
  id: true,
  bookingCode: true,
  patientName: true,
  patientPhone: true,
  patientEmail: true,
  appointmentDate: true,
  startTime: true,
  endTime: true,
  status: true,
  patientNote: true,
  staffNote: true,
  cancelReason: true,
  confirmedAt: true,
  cancelledAt: true,
  completedAt: true,
  doctor: { select: { id: true, fullName: true } },
  service: { select: { id: true, name: true, price: true } },
};

function serializeAppointment(appointment) {
  return {
    ...appointment,
    service: { ...appointment.service, price: appointment.service.price.toString() },
  };
}

export async function listAppointments(query) {
  const where = buildWhere(query);
  const skip = (query.page - 1) * query.limit;
  const [total, appointments] = await prisma.$transaction([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: [{ appointmentDate: "asc" }, { startTime: "asc" }],
      select: appointmentSelect,
    }),
  ]);
  return {
    items: appointments.map(serializeAppointment),
    meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
  };
}

function isAllowedTransition(from, to) {
  const transitions = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["COMPLETED", "CANCELLED", "NO_SHOW"],
    CANCELLED: [],
    COMPLETED: [],
    NO_SHOW: [],
  };
  return transitions[from]?.includes(to);
}

export async function changeAppointmentStatus(id, status, reason) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.appointment.findUnique({ where: { id } });
    if (!current) throw Object.assign(new Error("Không tìm thấy lịch hẹn."), { status: 404 });
    if (!isAllowedTransition(current.status, status)) {
      throw Object.assign(new Error(`Không thể chuyển trạng thái ${current.status} sang ${status}.`), { status: 422 });
    }
    const now = new Date();
    const data = {
      status,
      ...(status === "CONFIRMED" ? { confirmedAt: now } : {}),
      ...(status === "CANCELLED" ? { cancelledAt: now, cancelReason: reason } : {}),
      ...(status === "COMPLETED" ? { completedAt: now } : {}),
    };
    const updated = await tx.appointment.update({
      where: { id },
      data: { ...data, statusHistory: { create: { fromStatus: current.status, toStatus: status, reason } } },
      select: appointmentSelect,
    });
    return serializeAppointment(updated);
  });
}

function groupKey(date, groupBy) {
  const value = new Date(date);
  if (groupBy === "day") return value.toISOString().slice(0, 10);
  const day = value.getUTCDay() || 7;
  value.setUTCDate(value.getUTCDate() - day + 1);
  return value.toISOString().slice(0, 10);
}

export async function appointmentStatistics(query = {}) {
  const appointments = await prisma.appointment.findMany({
    where: {
      ...buildWhere(query),
      ...(query.specialtyId ? { specialtyId: query.specialtyId } : {}),
    },
    select: { status: true, appointmentDate: true },
  });
  const byStatus = Object.fromEntries(statuses.map((status) => [status, 0]));
  const byPeriod = new Map();
  const todayStr = new Date().toISOString().slice(0, 10);
  let todayCount = 0;

  for (const appointment of appointments) {
    if (byStatus[appointment.status] !== undefined) {
      byStatus[appointment.status] += 1;
    }
    const aptDateStr = new Date(appointment.appointmentDate).toISOString().slice(0, 10);
    if (aptDateStr === todayStr) {
      todayCount += 1;
    }
    const key = groupKey(appointment.appointmentDate, query.groupBy || "day");
    byPeriod.set(key, (byPeriod.get(key) || 0) + 1);
  }
  return {
    from: query.from,
    to: query.to,
    groupBy: query.groupBy || "day",
    total: appointments.length,
    todayCount,
    byStatus,
    byPeriod: [...byPeriod.entries()].sort(([first], [second]) => first.localeCompare(second)).map(([period, count]) => ({ period, count })),
  };
}

export { activeStatuses };