import crypto from "node:crypto";
import { prisma } from "../models/index.js";

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED"];

function dateValue(date) {
  return new Date(`${date}T00:00:00.000Z`);
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
    minutes % 60,
  )}`;
}

function bookingCode() {
  return `MA-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

function error(status, message) {
  return Object.assign(new Error(message), { status });
}

async function validateBookingSlot(tx, input) {
  const appointmentDate = dateValue(input.appointmentDate);
  const service = await tx.service.findFirst({
    where: {
      id: input.serviceId,
      status: "ACTIVE",
      ...(input.specialtyId ? { specialtyId: input.specialtyId } : {}),
    },
    select: { id: true, durationMinutes: true, specialtyId: true },
  });
  const doctor = await tx.doctor.findFirst({
    where: { id: input.doctorId, status: "ACTIVE" },
    select: { id: true },
  });

  if (!service || !doctor) {
    throw error(422, "Bác sĩ hoặc dịch vụ không hợp lệ.");
  }

  const relation = await tx.doctorSpecialty.findFirst({
    where: {
      doctorId: input.doctorId,
      specialtyId: service.specialtyId ?? input.specialtyId,
    },
  });
  if (!relation) throw error(422, "Bác sĩ không cung cấp dịch vụ này.");

  const dayOfWeek = appointmentDate.getUTCDay();
  const exception = await tx.scheduleException.findFirst({
    where: { doctorId: input.doctorId, exceptionDate: appointmentDate },
  });
  if (exception?.type === "DAY_OFF") {
    throw error(422, "Bác sĩ nghỉ vào ngày đã chọn.");
  }

  const schedules = await tx.workingSchedule.findMany({
    where: {
      doctorId: input.doctorId,
      dayOfWeek,
      status: "ACTIVE",
      effectiveFrom: { lte: appointmentDate },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: appointmentDate } }],
    },
  });
  const scheduleRanges = exception?.type === "CUSTOM_HOURS"
    ? [{ startTime: exception.startTime, endTime: exception.endTime }]
    : schedules;
  const start = timeToMinutes(input.startTime);
  const end = start + service.durationMinutes;
  const insideSchedule = scheduleRanges.some(
    (range) =>
      range.startTime &&
      range.endTime &&
      start >= timeToMinutes(range.startTime) &&
      end <= timeToMinutes(range.endTime) &&
      (start - timeToMinutes(range.startTime)) % 30 === 0,
  );
  if (!insideSchedule) throw error(422, "Khung giờ nằm ngoài lịch làm việc.");

  const conflict = await tx.appointment.findFirst({
    where: {
      doctorId: input.doctorId,
      appointmentDate,
      startTime: input.startTime,
      status: { in: ACTIVE_STATUSES },
    },
  });
  if (conflict) throw error(409, "Khung giờ đã được đặt. Vui lòng chọn giờ khác.");

  return { appointmentDate, endTime: minutesToTime(end), specialtyId: service.specialtyId };
}

export async function createAppointment(input) {
  try {
    return await prisma.$transaction(async (tx) => {
      const slot = await validateBookingSlot(tx, input);
      const appointment = await tx.appointment.create({
        data: {
          bookingCode: bookingCode(),
          patientId: input.patientId || null,
          patientName: input.patientName,
          patientPhone: input.patientPhone,
          patientEmail: input.patientEmail || null,
          doctorId: input.doctorId,
          specialtyId: slot.specialtyId ?? input.specialtyId,
          serviceId: input.serviceId,
          appointmentDate: slot.appointmentDate,
          startTime: input.startTime,
          endTime: slot.endTime,
          patientNote: input.patientNote || null,
          statusHistory: {
            create: { toStatus: "PENDING", reason: "Bệnh nhân tạo lịch hẹn." },
          },
        },
        select: {
          id: true,
          bookingCode: true,
          patientName: true,
          patientPhone: true,
          patientEmail: true,
          appointmentDate: true,
          startTime: true,
          endTime: true,
          status: true,
          doctor: { select: { id: true, fullName: true } },
          service: { select: { id: true, name: true, price: true } },
        },
      });
      return { ...appointment, service: { ...appointment.service, price: appointment.service.price.toString() } };
    }, { isolationLevel: "Serializable" });
  } catch (err) {
    if (err.code === "P2002") throw error(409, "Khung giờ đã được đặt. Vui lòng chọn giờ khác.");
    throw err;
  }
}

export function lookupAppointment(input) {
  return prisma.appointment.findFirst({
    where: { bookingCode: input.bookingCode, patientPhone: input.patientPhone },
    select: {
      id: true, bookingCode: true, patientName: true, patientPhone: true,
      patientEmail: true, appointmentDate: true, startTime: true, endTime: true,
      status: true, cancelReason: true,
      doctor: { select: { id: true, fullName: true } },
      service: { select: { id: true, name: true, price: true } },
    },
  }).then((appointment) => appointment && {
    ...appointment,
    service: { ...appointment.service, price: appointment.service.price.toString() },
  });
}

export async function cancelAppointment(id, input) {
  const appointment = await prisma.appointment.findFirst({
    where: { id, patientPhone: input.patientPhone },
  });
  if (!appointment) throw error(404, "Không tìm thấy lịch hẹn.");
  if (!ACTIVE_STATUSES.includes(appointment.status)) {
    throw error(422, "Lịch hẹn không còn được phép hủy.");
  }
  const appointmentStart = new Date(
    `${appointment.appointmentDate.toISOString().slice(0, 10)}T${appointment.startTime}:00+07:00`,
  );
  if (appointmentStart.getTime() - Date.now() < 2 * 60 * 60 * 1000) {
    throw error(422, "Chỉ được hủy lịch trước giờ khám tối thiểu 2 giờ.");
  }
  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancelReason: input.cancelReason,
      cancelledAt: new Date(),
      statusHistory: {
        create: {
          fromStatus: appointment.status,
          toStatus: "CANCELLED",
          reason: input.cancelReason,
        },
      },
    },
    select: { id: true, bookingCode: true, status: true, cancelReason: true },
  });
  return updated;
}

export async function getMyAppointments(user) {
  const appointments = await prisma.appointment.findMany({
    where: {
      OR: [
        ...(user.id ? [{ patientId: user.id }] : []),
        ...(user.phone ? [{ patientPhone: user.phone }] : []),
        ...(user.email ? [{ patientEmail: user.email }] : []),
      ],
    },
    orderBy: [{ appointmentDate: "desc" }, { startTime: "desc" }],
    select: {
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
      cancelReason: true,
      doctor: { select: { id: true, fullName: true, title: true } },
      service: { select: { id: true, name: true, price: true } },
    },
  });

  return appointments.map((appointment) => ({
    ...appointment,
    service: { ...appointment.service, price: appointment.service.price.toString() },
  }));
}