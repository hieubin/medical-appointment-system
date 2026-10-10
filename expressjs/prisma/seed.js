import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const specialties = [
  { name: "Nội tổng quát", slug: "noi-tong-quat", description: "Khám và điều trị các bệnh lý nội khoa thường gặp." },
  { name: "Tim mạch", slug: "tim-mach", description: "Khám, theo dõi và điều trị các bệnh lý tim mạch." },
  { name: "Nhi khoa", slug: "nhi-khoa", description: "Chăm sóc sức khỏe và điều trị bệnh cho trẻ em." },
  { name: "Sản phụ khoa", slug: "san-phu-khoa", description: "Chăm sóc sức khỏe phụ nữ, thai sản và phụ khoa." },
  { name: "Da liễu", slug: "da-lieu", description: "Khám và điều trị các bệnh lý da, tóc và móng." },
  { name: "Tai mũi họng", slug: "tai-mui-hong", description: "Khám và điều trị các bệnh lý tai, mũi, họng." },
  { name: "Răng hàm mặt", slug: "rang-ham-mat", description: "Khám và điều trị các bệnh lý răng, hàm và mặt." },
  { name: "Cơ xương khớp", slug: "co-xuong-khop", description: "Khám và điều trị các bệnh lý cơ, xương và khớp." },
  { name: "Mắt", slug: "mat", description: "Khám và điều trị các bệnh lý mắt." },
  { name: "Thần kinh", slug: "than-kinh", description: "Khám và điều trị các bệnh lý thần kinh." },
];

const doctors = [
  { fullName: "BS.CKII Nguyễn Minh An", title: "Bác sĩ chuyên khoa II", bio: "15 năm kinh nghiệm trong lĩnh vực tim mạch.", licenseNumber: "VN-001", specialtySlugs: ["tim-mach", "noi-tong-quat"] },
  { fullName: "BS. Trần Thu Hà", title: "Bác sĩ chuyên khoa Nhi", bio: "Chuyên gia chăm sóc sức khỏe trẻ em.", licenseNumber: "VN-002", specialtySlugs: ["nhi-khoa"] },
  { fullName: "BS.CKII Lê Hoàng Nam", title: "Bác sĩ chuyên khoa II", bio: "Chuyên điều trị cơ xương khớp và phục hồi chức năng.", licenseNumber: "VN-003", specialtySlugs: ["co-xuong-khop", "noi-tong-quat"] },
  { fullName: "BS.CKI Phạm Thị Mai", title: "Bác sĩ chuyên khoa I", bio: "Chuyên khám và điều trị phụ khoa.", licenseNumber: "VN-004", specialtySlugs: ["san-phu-khoa"] },
  { fullName: "BS.CKII Hoàng Văn Tùng", title: "Bác sĩ chuyên khoa II", bio: "Chuyên gia về da liễu và các bệnh qua đường tiếp xúc.", licenseNumber: "VN-005", specialtySlugs: ["da-lieu"] },
  { fullName: "BS. Vũ Thị Lan", title: "Bác sĩ", bio: "Khám và điều trị các bệnh lý tai, mũi, họng.", licenseNumber: "VN-006", specialtySlugs: ["tai-mui-hong"] },
  { fullName: "BS.CKI Đặng Minh Quang", title: "Bác sĩ chuyên khoa I", bio: "Chuyên răng hàm mặt tổng quát và Implant.", licenseNumber: "VN-007", specialtySlugs: ["rang-ham-mat"] },
  { fullName: "BS.CKII Ngô Thị Hương", title: "Bác sĩ chuyên khoa II", bio: "Chuyên về nhãn khoa và phẫu thuật mắt.", licenseNumber: "VN-008", specialtySlugs: ["mat"] },
  { fullName: "BS.CKII Trịnh Đình Khoa", title: "Bác sĩ chuyên khoa II", bio: "Chuyên điều trị các bệnh lý thần kinh phức tạp.", licenseNumber: "VN-009", specialtySlugs: ["than-kinh"] },
  { fullName: "BS. Lê Minh Tuấn", title: "Bác sĩ", bio: "Nội tổng quát và cấp cứu ban đầu.", licenseNumber: "VN-010", specialtySlugs: ["noi-tong-quat"] },
];

const services = [
  { name: "Khám nội tổng quát", slug: "kham-noi-tong-quat", description: "Khám và tư vấn các bệnh lý nội khoa thường gặp.", durationMinutes: 30, price: 300000, specialtySlug: "noi-tong-quat" },
  { name: "Khám tim mạch", slug: "kham-tim-mach", description: "Khám chuyên sâu tim mạch, điện tim.", durationMinutes: 45, price: 500000, specialtySlug: "tim-mach" },
  { name: "Khám nhi khoa", slug: "kham-nhi-khoa", description: "Khám và chăm sóc sức khỏe trẻ em.", durationMinutes: 30, price: 250000, specialtySlug: "nhi-khoa" },
  { name: "Khám sản phụ khoa", slug: "kham-san-phu-khoa", description: "Khám phụ khoa, tư vấn thai sản.", durationMinutes: 30, price: 350000, specialtySlug: "san-phu-khoa" },
  { name: "Khám da liễu", slug: "kham-da-lieu", description: "Khám và điều trị các bệnh lý da.", durationMinutes: 30, price: 280000, specialtySlug: "da-lieu" },
  { name: "Khám tai mũi họng", slug: "kham-tai-mui-hong", description: "Khám và điều trị tai, mũi, họng.", durationMinutes: 30, price: 270000, specialtySlug: "tai-mui-hong" },
  { name: "Khám răng hàm mặt", slug: "kham-rang-ham-mat", description: "Khám răng, lấy cao răng, nhổ răng.", durationMinutes: 30, price: 200000, specialtySlug: "rang-ham-mat" },
  { name: "Khám cơ xương khớp", slug: "kham-co-xuong-khop", description: "Khám và điều trị các bệnh lý cơ xương khớp.", durationMinutes: 30, price: 350000, specialtySlug: "co-xuong-khop" },
  { name: "Khám mắt", slug: "kham-mat", description: "Khám thị lực, đo khúc xạ.", durationMinutes: 30, price: 300000, specialtySlug: "mat" },
  { name: "Khám thần kinh", slug: "kham-than-kinh", description: "Khám và tư vấn các bệnh lý thần kinh.", durationMinutes: 45, price: 450000, specialtySlug: "than-kinh" },
  { name: "Siêu âm tim", slug: "sieu-am-tim", description: "Siêu âm Doppler tim, phát hiện bệnh lý tim mạch.", durationMinutes: 30, price: 600000, specialtySlug: "tim-mach" },
  { name: "Xét nghiệm máu tổng quát", slug: "xet-nghiem-mau", description: "Xét nghiệm công thức máu, sinh hóa.", durationMinutes: 15, price: 400000, specialtySlug: "noi-tong-quat" },
];

const appointments = [
  { bookingCode: "APT-001-2026", patientName: "Nguyễn Văn A", patientPhone: "0901111222", patientEmail: "vana@test.com", doctorLicense: "VN-001", serviceSlug: "kham-tim-mach", specialtySlug: "tim-mach", appointmentDate: "2026-10-05", startTime: "08:00", status: "PENDING" },
  { bookingCode: "APT-002-2026", patientName: "Trần Thị B", patientPhone: "0902222333", patientEmail: "thib@test.com", doctorLicense: "VN-002", serviceSlug: "kham-nhi-khoa", specialtySlug: "nhi-khoa", appointmentDate: "2026-10-05", startTime: "09:00", status: "CONFIRMED" },
  { bookingCode: "APT-003-2026", patientName: "Lê Văn C", patientPhone: "0903333444", patientEmail: "vanc@test.com", doctorLicense: "VN-003", serviceSlug: "kham-co-xuong-khop", specialtySlug: "co-xuong-khop", appointmentDate: "2026-10-06", startTime: "10:00", status: "CONFIRMED" },
  { bookingCode: "APT-004-2026", patientName: "Phạm Thị D", patientPhone: "0904444555", patientEmail: "thid@test.com", doctorLicense: "VN-004", serviceSlug: "kham-san-phu-khoa", specialtySlug: "san-phu-khoa", appointmentDate: "2026-10-06", startTime: "14:00", status: "PENDING" },
  { bookingCode: "APT-005-2026", patientName: "Hoàng Văn E", patientPhone: "0905555666", patientEmail: "vane@test.com", doctorLicense: "VN-005", serviceSlug: "kham-da-lieu", specialtySlug: "da-lieu", appointmentDate: "2026-10-07", startTime: "08:30", status: "CONFIRMED" },
  { bookingCode: "APT-006-2026", patientName: "Vũ Thị F", patientPhone: "0906666777", patientEmail: "thif@test.com", doctorLicense: "VN-006", serviceSlug: "kham-tai-mui-hong", specialtySlug: "tai-mui-hong", appointmentDate: "2026-10-07", startTime: "09:30", status: "PENDING" },
  { bookingCode: "APT-007-2026", patientName: "Đặng Minh G", patientPhone: "0907777888", patientEmail: "mingh@test.com", doctorLicense: "VN-007", serviceSlug: "kham-rang-ham-mat", specialtySlug: "rang-ham-mat", appointmentDate: "2026-10-08", startTime: "10:00", status: "CONFIRMED" },
  { bookingCode: "APT-008-2026", patientName: "Ngô Thị H", patientPhone: "0908888999", patientEmail: "tihh@test.com", doctorLicense: "VN-008", serviceSlug: "kham-mat", specialtySlug: "mat", appointmentDate: "2026-10-08", startTime: "14:00", status: "CONFIRMED" },
  { bookingCode: "APT-009-2026", patientName: "Trịnh Đình I", patientPhone: "0909999000", patientEmail: "dinhi@test.com", doctorLicense: "VN-009", serviceSlug: "kham-than-kinh", specialtySlug: "than-kinh", appointmentDate: "2026-10-09", startTime: "08:00", status: "PENDING" },
  { bookingCode: "APT-010-2026", patientName: "Lê Minh J", patientPhone: "0910000111", patientEmail: "minhj@test.com", doctorLicense: "VN-010", serviceSlug: "kham-noi-tong-quat", specialtySlug: "noi-tong-quat", appointmentDate: "2026-10-09", startTime: "09:00", status: "CONFIRMED" },
];

const demoUsers = [
  { email: "admin@clinic.test", password: "Admin123!", fullName: "Admin Bệnh Viện", role: "ADMIN" },
  { email: "bacsi1@clinic.test", password: "Doctor123!", fullName: "BS. Nguyễn Minh An", role: "DOCTOR" },
  { email: "bacsi2@clinic.test", password: "Doctor123!", fullName: "BS. Trần Thu Hà", role: "DOCTOR" },
  { email: "patient@clinic.test", password: "Patient123!", fullName: "Bệnh Nhân Demo", role: "PATIENT" },
  { email: "bn1@test.com", password: "Patient123!", fullName: "Nguyễn Văn A", role: "PATIENT" },
  { email: "bn2@test.com", password: "Patient123!", fullName: "Trần Thị B", role: "PATIENT" },
];

async function main() {
  console.log("🔄 Bắt đầu seed database...");

  const specialtyRecords = new Map();
  const doctorRecords = new Map();
  const serviceRecords = new Map();

  // Users
  for (const demoUser of demoUsers) {
    const passwordHash = await bcrypt.hash(demoUser.password, 10);
    await prisma.user.upsert({
      where: { email: demoUser.email },
      update: { passwordHash, fullName: demoUser.fullName, role: demoUser.role, status: "ACTIVE" },
      create: { email: demoUser.email, passwordHash, fullName: demoUser.fullName, role: demoUser.role, status: "ACTIVE" },
    });
  }
  const removedStaff = await prisma.user.deleteMany({ where: { role: "STAFF" } });
  if (removedStaff.count) console.log(`✅ Đã gỡ ${removedStaff.count} tài khoản nhân viên`);
  console.log(`✅ ${demoUsers.length} users`);

  // Specialties
  for (const specialty of specialties) {
    const record = await prisma.specialty.upsert({
      where: { slug: specialty.slug },
      update: { name: specialty.name, description: specialty.description, status: "ACTIVE" },
      create: specialty,
    });
    specialtyRecords.set(specialty.slug, record);
  }
  console.log(`✅ ${specialties.length} specialties`);

  // Doctors
  for (const doctor of doctors) {
    const doctorRecord = await prisma.doctor.upsert({
      where: { licenseNumber: doctor.licenseNumber },
      update: { fullName: doctor.fullName, title: doctor.title, bio: doctor.bio, status: "ACTIVE" },
      create: { fullName: doctor.fullName, title: doctor.title, bio: doctor.bio, licenseNumber: doctor.licenseNumber, status: "ACTIVE" },
    });
    doctorRecords.set(doctor.licenseNumber, doctorRecord);

    for (const specialtySlug of doctor.specialtySlugs) {
      const specialtyRecord = specialtyRecords.get(specialtySlug);
      if (specialtyRecord) {
        await prisma.doctorSpecialty.upsert({
          where: { doctorId_specialtyId: { doctorId: doctorRecord.id, specialtyId: specialtyRecord.id } },
          update: {},
          create: { doctorId: doctorRecord.id, specialtyId: specialtyRecord.id },
        });
      }
    }
  }
  console.log(`✅ ${doctors.length} doctors`);

  // Services
  for (const service of services) {
    const specialtyRecord = specialtyRecords.get(service.specialtySlug);
    const serviceRecord = await prisma.service.upsert({
      where: { slug: service.slug },
      update: { name: service.name, description: service.description, durationMinutes: service.durationMinutes, price: service.price, specialtyId: specialtyRecord?.id, status: "ACTIVE" },
      create: { name: service.name, slug: service.slug, description: service.description, durationMinutes: service.durationMinutes, price: service.price, specialtyId: specialtyRecord?.id, status: "ACTIVE" },
    });
    serviceRecords.set(service.slug, serviceRecord);
  }
  console.log(`✅ ${services.length} services`);

  // Working Schedules
  const effectiveFrom = new Date("2025-01-01T00:00:00.000Z");
  for (const doctor of doctors) {
    const doctorRecord = doctorRecords.get(doctor.licenseNumber);
    for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek += 1) {
      for (const schedule of [{ startTime: "08:00", endTime: "12:00" }, { startTime: "13:00", endTime: "17:00" }]) {
        await prisma.workingSchedule.upsert({
          where: { doctorId_dayOfWeek_startTime_effectiveFrom: { doctorId: doctorRecord.id, dayOfWeek, startTime: schedule.startTime, effectiveFrom } },
          update: { endTime: schedule.endTime, slotDurationMinutes: 30, status: "ACTIVE" },
          create: { doctorId: doctorRecord.id, dayOfWeek, startTime: schedule.startTime, endTime: schedule.endTime, slotDurationMinutes: 30, effectiveFrom, status: "ACTIVE" },
        });
      }
    }
  }
  console.log(`✅ Schedules cho ${doctors.length} bác sĩ (T2-T6, 8h-12h, 13h-17h)`);

  // Appointments
  for (const appointment of appointments) {
    const doctorRecord = doctorRecords.get(appointment.doctorLicense);
    const serviceRecord = serviceRecords.get(appointment.serviceSlug);
    const specialtyRecord = specialtyRecords.get(appointment.specialtySlug);
    const appointmentDate = new Date(`${appointment.appointmentDate}T00:00:00.000Z`);
    const [hours, minutes] = appointment.startTime.split(":").map(Number);
    const endMinutes = hours * 60 + minutes + (serviceRecord?.durationMinutes || 30);
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
    const now = new Date();

    const record = await prisma.appointment.upsert({
      where: { bookingCode: appointment.bookingCode },
      update: { patientName: appointment.patientName, patientPhone: appointment.patientPhone, patientEmail: appointment.patientEmail, doctorId: doctorRecord.id, specialtyId: specialtyRecord.id, serviceId: serviceRecord.id, appointmentDate, startTime: appointment.startTime, endTime, status: appointment.status, confirmedAt: appointment.status === "CONFIRMED" ? now : null, cancelledAt: appointment.status === "CANCELLED" ? now : null, completedAt: appointment.status === "COMPLETED" ? now : null },
      create: { bookingCode: appointment.bookingCode, patientName: appointment.patientName, patientPhone: appointment.patientPhone, patientEmail: appointment.patientEmail, doctorId: doctorRecord.id, specialtyId: specialtyRecord.id, serviceId: serviceRecord.id, appointmentDate, startTime: appointment.startTime, endTime, status: appointment.status, confirmedAt: appointment.status === "CONFIRMED" ? now : null, cancelledAt: appointment.status === "CANCELLED" ? now : null, completedAt: appointment.status === "COMPLETED" ? now : null },
    });

    await prisma.appointmentStatusHistory.deleteMany({ where: { appointmentId: record.id } });
    await prisma.appointmentStatusHistory.create({
      data: { appointmentId: record.id, toStatus: appointment.status, reason: "Seed data" },
    });
  }
  console.log(`✅ ${appointments.length} appointments`);

  // Medical Records for demo patient
  const demoPatient = await prisma.user.findUnique({ where: { email: "patient@clinic.test" } });
  if (demoPatient) {
    await prisma.medicalRecord.upsert({
      where: { id: "demo-record-001" },
      update: { userId: demoPatient.id, weight: 65, height: 170, bloodPressure: "120/80", heartRate: 72, temperature: 36.5, allergies: "Không có", medicalHistory: "Không có tiền sử bệnh lý", notes: "Khám định kỳ tốt" },
      create: { id: "demo-record-001", userId: demoPatient.id, weight: 65, height: 170, bloodPressure: "120/80", heartRate: 72, temperature: 36.5, allergies: "Không có", medicalHistory: "Không có tiền sử bệnh lý", notes: "Khám định kỳ tốt" },
    });
    console.log(`✅ Medical record cho demo patient`);
  }

  console.log("\n🎉 Seed hoàn tất!");
  console.log("\n📋 Tài khoản demo:");
  console.log("   Admin: admin@clinic.test / Admin123!");
  console.log("   Patient: patient@clinic.test / Patient123!");
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
