import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const specialties = [
  {
    name: "Nội tổng quát",
    slug: "noi-tong-quat",
    description: "Khám và điều trị các bệnh lý nội khoa thường gặp.",
  },
  {
    name: "Tim mạch",
    slug: "tim-mach",
    description: "Khám, theo dõi và điều trị các bệnh lý tim mạch.",
  },
  {
    name: "Nhi khoa",
    slug: "nhi-khoa",
    description: "Chăm sóc sức khỏe và điều trị bệnh cho trẻ em.",
  },
  {
    name: "Sản phụ khoa",
    slug: "san-phu-khoa",
    description: "Chăm sóc sức khỏe phụ nữ, thai sản và phụ khoa.",
  },
  {
    name: "Da liễu",
    slug: "da-lieu",
    description: "Khám và điều trị các bệnh lý da, tóc và móng.",
  },
  {
    name: "Tai mũi họng",
    slug: "tai-mui-hong",
    description: "Khám và điều trị các bệnh lý tai, mũi, họng.",
  },
  {
    name: "Răng hàm mặt",
    slug: "rang-ham-mat",
    description: "Khám và điều trị các bệnh lý răng, hàm và mặt.",
  },
  {
    name: "Cơ xương khớp",
    slug: "co-xuong-khop",
    description: "Khám và điều trị các bệnh lý cơ, xương và khớp.",
  },
];

const doctors = [
  {
    fullName: "BS.CKII Nguyễn Minh An",
    slug: "nguyen-minh-an",
    title: "Bác sĩ chuyên khoa II",
    bio: "Bác sĩ có kinh nghiệm khám và điều trị bệnh lý tim mạch.",
    licenseNumber: "VN-001",
    specialtySlugs: ["tim-mach", "noi-tong-quat"],
  },
  {
    fullName: "BS. Trần Thu Hà",
    slug: "tran-thu-ha",
    title: "Bác sĩ chuyên khoa Nhi",
    bio: "Bác sĩ chuyên khám và chăm sóc sức khỏe trẻ em.",
    licenseNumber: "VN-002",
    specialtySlugs: ["nhi-khoa"],
  },
  {
    fullName: "BS.CKII Lê Hoàng Nam",
    slug: "le-hoang-nam",
    title: "Bác sĩ chuyên khoa II",
    bio: "Bác sĩ chuyên điều trị các bệnh lý cơ xương khớp.",
    licenseNumber: "VN-003",
    specialtySlugs: ["co-xuong-khop", "noi-tong-quat"],
  },
];

const services = [
  {
    name: "Khám nội tổng quát",
    slug: "kham-noi-tong-quat",
    description: "Khám và tư vấn các bệnh lý nội khoa thường gặp.",
    durationMinutes: 30,
    price: 300000n,
    specialtySlug: "noi-tong-quat",
  },
  {
    name: "Khám tim mạch",
    slug: "kham-tim-mach",
    description: "Khám và tư vấn các bệnh lý tim mạch.",
    durationMinutes: 30,
    price: 400000n,
    specialtySlug: "tim-mach",
  },
  {
    name: "Khám nhi khoa",
    slug: "kham-nhi-khoa",
    description: "Khám và tư vấn sức khỏe cho trẻ em.",
    durationMinutes: 30,
    price: 250000n,
    specialtySlug: "nhi-khoa",
  },
  {
    name: "Khám cơ xương khớp",
    slug: "kham-co-xuong-khop",
    description: "Khám và điều trị các bệnh lý cơ xương khớp.",
    durationMinutes: 30,
    price: 350000n,
    specialtySlug: "co-xuong-khop",
  },
];

async function main() {
  const specialtyRecords = new Map();
  const doctorRecords = new Map();

  for (const specialty of specialties) {
    const record = await prisma.specialty.upsert({
      where: { slug: specialty.slug },
      update: {
        name: specialty.name,
        description: specialty.description,
        status: "ACTIVE",
      },
      create: specialty,
    });

    specialtyRecords.set(specialty.slug, record);
  }

  for (const doctor of doctors) {
    const doctorRecord = await prisma.doctor.upsert({
      where: { licenseNumber: doctor.licenseNumber },
      update: {
        fullName: doctor.fullName,
        title: doctor.title,
        bio: doctor.bio,
        status: "ACTIVE",
      },
      create: {
        fullName: doctor.fullName,
        title: doctor.title,
        bio: doctor.bio,
        licenseNumber: doctor.licenseNumber,
      },
    });
    doctorRecords.set(doctor.licenseNumber, doctorRecord);

    for (const specialtySlug of doctor.specialtySlugs) {
      const specialtyRecord = specialtyRecords.get(specialtySlug);

      await prisma.doctorSpecialty.upsert({
        where: {
          doctorId_specialtyId: {
            doctorId: doctorRecord.id,
            specialtyId: specialtyRecord.id,
          },
        },
        update: {},
        create: {
          doctorId: doctorRecord.id,
          specialtyId: specialtyRecord.id,
        },
      });
    }
  }

  for (const service of services) {
    const specialtyRecord = specialtyRecords.get(service.specialtySlug);

    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        description: service.description,
        durationMinutes: service.durationMinutes,
        price: service.price,
        status: "ACTIVE",
        specialtyId: specialtyRecord.id,
        slug: service.slug,
      },
      create: {
        name: service.name,
        slug: service.slug,
        description: service.description,
        durationMinutes: service.durationMinutes,
        price: service.price,
        status: "ACTIVE",
        specialtyId: specialtyRecord.id,
      },
    });
  }

  const effectiveFrom = new Date("2025-01-01T00:00:00.000Z");
  for (const doctor of doctors) {
    const doctorRecord = doctorRecords.get(doctor.licenseNumber);

    for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek += 1) {
      for (const schedule of [
        { startTime: "08:00", endTime: "12:00" },
        { startTime: "13:00", endTime: "17:00" },
      ]) {
        await prisma.workingSchedule.upsert({
          where: {
            doctorId_dayOfWeek_startTime_effectiveFrom: {
              doctorId: doctorRecord.id,
              dayOfWeek,
              startTime: schedule.startTime,
              effectiveFrom,
            },
          },
          update: {
            endTime: schedule.endTime,
            slotDurationMinutes: 30,
            status: "ACTIVE",
          },
          create: {
            doctorId: doctorRecord.id,
            dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            slotDurationMinutes: 30,
            effectiveFrom,
            status: "ACTIVE",
          },
        });
      }
    }
  }

  console.log(
    `Seeded ${specialties.length} specialties, ${doctors.length} doctors, ${services.length} services, and schedules.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });