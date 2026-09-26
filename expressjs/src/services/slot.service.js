import { prisma } from "../models/index.js";

const ACTIVE_APPOINTMENT_STATUSES = ["PENDING", "CONFIRMED"];

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
  ).padStart(2, "0")}`;
}

function isPast(date, time) {
  return new Date(`${date}T${time}:00+07:00`) <= new Date();
}

export async function getAvailableSlots(doctorId, date) {
  const appointmentDate = dateValue(date);
  const dayOfWeek = appointmentDate.getUTCDay();
  const doctor = await prisma.doctor.findFirst({
    where: { id: doctorId, status: "ACTIVE" },
    select: {
      id: true,
      schedules: {
        where: {
          dayOfWeek,
          status: "ACTIVE",
          effectiveFrom: { lte: appointmentDate },
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: appointmentDate } }],
        },
      },
      exceptions: { where: { exceptionDate: appointmentDate } },
    },
  });

  if (!doctor) return null;

  const exception = doctor.exceptions[0];
  if (exception?.type === "DAY_OFF") return [];

  const schedules = exception?.type === "CUSTOM_HOURS"
    ? [{
        startTime: exception.startTime,
        endTime: exception.endTime,
        slotDurationMinutes: doctor.schedules[0]?.slotDurationMinutes ?? 30,
      }]
    : doctor.schedules;

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      appointmentDate,
      status: { in: ACTIVE_APPOINTMENT_STATUSES },
    },
    select: { startTime: true },
  });
  const occupied = new Set(appointments.map(({ startTime }) => startTime));
  const slots = [];

  for (const schedule of schedules) {
    if (!schedule.startTime || !schedule.endTime) continue;
    const start = timeToMinutes(schedule.startTime);
    const end = timeToMinutes(schedule.endTime);
    for (
      let current = start;
      current + schedule.slotDurationMinutes <= end;
      current += schedule.slotDurationMinutes
    ) {
      const startTime = minutesToTime(current);
      if (!occupied.has(startTime) && !isPast(date, startTime)) {
        slots.push({
          startTime,
          endTime: minutesToTime(current + schedule.slotDurationMinutes),
        });
      }
    }
  }

  return slots;
}