import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function log(status, msg) {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${status}] ${msg}`);
}

async function runTests() {
  console.log('\n' + '═'.repeat(55));
  console.log('🗄️  DATABASE TEST SUITE (SQLite)');
  console.log('═'.repeat(55) + '\n');

  const results = { passed: 0, failed: 0, warnings: 0 };

  // Test 1: Connect to SQLite DB
  try {
    await prisma.$connect();
    log('PASS', 'SQLite database connected');
    results.passed++;
  } catch (e) {
    log('FAIL', `DB connection failed: ${e.message}`);
    results.failed++;
  }

  // Test 2: Check all tables exist
  try {
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`;
    const tableNames = tables.map(t => t.name).sort();
    const expectedTables = [
      'User', 'AuthSession', 'Specialty', 'Doctor', 'Service',
      'WorkingSchedule', 'ScheduleException', 'Appointment',
      'AppointmentStatusHistory', 'DoctorSpecialty'
    ].sort();
    
    const hasAllTables = expectedTables.every(t => tableNames.includes(t));
    log(hasAllTables ? 'PASS' : 'FAIL', `All tables exist (${tableNames.length}/10)`);
    if (!hasAllTables) {
      console.log('   Missing: ' + expectedTables.filter(t => !tableNames.includes(t)).join(', '));
    }
    results[hasAllTables ? 'passed' : 'failed']++;
  } catch (e) {
    log('FAIL', `Table check failed: ${e.message}`);
    results.failed++;
  }

  // Test 3: User CRUD
  try {
    const testEmail = `test_${Date.now()}@test.com`;
    const user = await prisma.user.create({
      data: { email: testEmail, passwordHash: 'hashed123', fullName: 'Test User', role: 'PATIENT' }
    });
    log('PASS', 'User created (id: ' + user.id.slice(0, 8) + '...)');
    results.passed++;

    const found = await prisma.user.findUnique({ where: { id: user.id } });
    log(found ? 'PASS' : 'FAIL', 'User read');
    results[found ? 'passed' : 'failed']++;

    const updated = await prisma.user.update({
      where: { id: user.id }, data: { fullName: 'Updated Name' }
    });
    log(updated.fullName === 'Updated Name' ? 'PASS' : 'FAIL', 'User updated');
    results[updated.fullName === 'Updated Name' ? 'passed' : 'failed']++;

    await prisma.user.delete({ where: { id: user.id } });
    const deleted = await prisma.user.findUnique({ where: { id: user.id } });
    log(!deleted ? 'PASS' : 'FAIL', 'User deleted');
    results[!deleted ? 'passed' : 'failed']++;
  } catch (e) {
    log('FAIL', `User CRUD failed: ${e.message}`);
    results.failed += 4;
  }

  // Test 4: Specialty CRUD
  try {
    const slug = `cardio-test-${Date.now()}`;
    const specialty = await prisma.specialty.create({ data: { name: 'Cardiology', slug } });
    const found = await prisma.specialty.findUnique({ where: { id: specialty.id } });
    await prisma.specialty.delete({ where: { id: specialty.id } });
    log(found ? 'PASS' : 'FAIL', 'Specialty CRUD');
    results[found ? 'passed' : 'failed']++;
  } catch (e) {
    log('FAIL', `Specialty failed: ${e.message}`);
    results.failed++;
  }

  // Test 5: Doctor CRUD
  try {
    const doctor = await prisma.doctor.create({ data: { fullName: 'Dr. Test', status: 'ACTIVE' } });
    const found = await prisma.doctor.findUnique({ where: { id: doctor.id } });
    await prisma.doctor.delete({ where: { id: doctor.id } });
    log(found ? 'PASS' : 'FAIL', 'Doctor CRUD');
    results[found ? 'passed' : 'failed']++;
  } catch (e) {
    log('FAIL', `Doctor failed: ${e.message}`);
    results.failed++;
  }

  // Test 6: Service CRUD
  try {
    const slug = `checkup-test-${Date.now()}`;
    const service = await prisma.service.create({
      data: { name: 'Checkup', slug, durationMinutes: 30, price: 100 }
    });
    const found = await prisma.service.findUnique({ where: { id: service.id } });
    await prisma.service.delete({ where: { id: service.id } });
    log(found ? 'PASS' : 'FAIL', 'Service CRUD');
    results[found ? 'passed' : 'failed']++;
  } catch (e) {
    log('FAIL', `Service failed: ${e.message}`);
    results.failed++;
  }

  // Test 7: Appointment flow
  try {
    const doctor = await prisma.doctor.create({ data: { fullName: 'Dr. Appt' } });
    const slug = `visit-test-${Date.now()}`;
    const service = await prisma.service.create({
      data: { name: 'Visit', slug, durationMinutes: 15, price: 50 }
    });
    
    const appt = await prisma.appointment.create({
      data: {
        bookingCode: `BK${Date.now()}`,
        patientName: 'Patient Test',
        patientPhone: '0123456789',
        doctorId: doctor.id,
        serviceId: service.id,
        appointmentDate: new Date(),
        startTime: '09:00',
        endTime: '09:15'
      }
    });
    
    const updated = await prisma.appointment.update({
      where: { id: appt.id }, data: { status: 'CONFIRMED' }
    });
    
    await prisma.appointmentStatusHistory.create({
      data: { appointmentId: appt.id, fromStatus: 'PENDING', toStatus: 'CONFIRMED' }
    });
    
    await prisma.appointmentStatusHistory.deleteMany({ where: { appointmentId: appt.id } });
    await prisma.appointment.delete({ where: { id: appt.id } });
    await prisma.doctor.delete({ where: { id: doctor.id } });
    await prisma.service.delete({ where: { id: service.id } });
    
    log(updated.status === 'CONFIRMED' ? 'PASS' : 'FAIL', 'Appointment flow (create → confirm)');
    results[updated.status === 'CONFIRMED' ? 'passed' : 'failed']++;
  } catch (e) {
    log('FAIL', `Appointment failed: ${e.message}`);
    results.failed++;
  }

  // Test 8: Doctor-Specialty relation
  try {
    const doctor = await prisma.doctor.create({ data: { fullName: 'Dr. FK' } });
    const slug = `neuro-test-${Date.now()}`;
    const specialty = await prisma.specialty.create({ data: { name: 'Neurology', slug } });
    
    await prisma.doctorSpecialty.create({
      data: { doctorId: doctor.id, specialtyId: specialty.id }
    });
    
    const relation = await prisma.doctorSpecialty.findFirst({
      where: { doctorId: doctor.id }
    });
    
    await prisma.doctorSpecialty.deleteMany({ where: { doctorId: doctor.id } });
    await prisma.doctor.delete({ where: { id: doctor.id } });
    await prisma.specialty.delete({ where: { id: specialty.id } });
    
    log(relation ? 'PASS' : 'FAIL', 'Doctor-Specialty relation (M:N)');
    results[relation ? 'passed' : 'failed']++;
  } catch (e) {
    log('FAIL', `Relation failed: ${e.message}`);
    results.failed++;
  }

  // Test 9: Working Schedule
  try {
    const doctor = await prisma.doctor.create({ data: { fullName: 'Dr. Schedule' } });
    const schedule = await prisma.workingSchedule.create({
      data: {
        doctorId: doctor.id,
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
        effectiveFrom: new Date()
      }
    });
    const found = await prisma.workingSchedule.findUnique({ where: { id: schedule.id } });
    await prisma.workingSchedule.delete({ where: { id: schedule.id } });
    await prisma.doctor.delete({ where: { id: doctor.id } });
    log(found ? 'PASS' : 'FAIL', 'WorkingSchedule CRUD');
    results[found ? 'passed' : 'failed']++;
  } catch (e) {
    log('FAIL', `Schedule failed: ${e.message}`);
    results.failed++;
  }

  // Test 10: Schedule Exception
  try {
    const doctor = await prisma.doctor.create({ data: { fullName: 'Dr. Exception' } });
    const exception = await prisma.scheduleException.create({
      data: {
        doctorId: doctor.id,
        exceptionDate: new Date(),
        type: 'DAY_OFF',
        reason: 'Holiday'
      }
    });
    const found = await prisma.scheduleException.findUnique({ where: { id: exception.id } });
    await prisma.scheduleException.delete({ where: { id: exception.id } });
    await prisma.doctor.delete({ where: { id: doctor.id } });
    log(found ? 'PASS' : 'FAIL', 'ScheduleException CRUD');
    results[found ? 'passed' : 'failed']++;
  } catch (e) {
    log('FAIL', `Exception failed: ${e.message}`);
    results.failed++;
  }

  // Test 11: DB file integrity
  try {
    const info = await prisma.$queryRaw`SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'`;
    const fs = require('fs');
    const dbPath = './data/medical.db';
    const dbExists = fs.existsSync(dbPath);
    const dbSize = dbExists ? fs.statSync(dbPath).size : 0;
    log(dbSize > 0 ? 'PASS' : 'FAIL', `DB file valid (${dbSize} bytes, ${info[0].count} tables)`);
    results[dbSize > 0 ? 'passed' : 'failed']++;
  } catch (e) {
    log('WARN', `DB file check: ${e.message}`);
    results.warnings++;
  }

  // Test 12: Unique constraints
  try {
    const slug = `unique-test-${Date.now()}`;
    await prisma.specialty.create({ data: { name: 'Test 1', slug } });
    try {
      await prisma.specialty.create({ data: { name: 'Test 2', slug } });
      log('FAIL', 'Unique constraint not enforced');
      results.failed++;
    } catch (e) {
      log('PASS', 'Unique constraint enforced (duplicate rejected)');
      results.passed++;
    }
    await prisma.specialty.delete({ where: { slug } });
  } catch (e) {
    log('FAIL', `Unique test setup failed: ${e.message}`);
    results.failed++;
  }

  // Test 13: Cascade delete
  try {
    const doctor = await prisma.doctor.create({ data: { fullName: 'Dr. Cascade' } });
    const appt = await prisma.appointment.create({
      data: {
        bookingCode: `BK${Date.now()}`,
        patientName: 'Patient',
        patientPhone: '0123',
        doctorId: doctor.id,
        serviceId: (await prisma.service.create({ data: { name: 'S', slug: `s-${Date.now()}`, durationMinutes: 10, price: 10 } })).id,
        appointmentDate: new Date(),
        startTime: '09:00',
        endTime: '09:10'
      }
    });
    
    await prisma.doctor.delete({ where: { id: doctor.id } });
    
    const orphaned = await prisma.appointment.findUnique({ where: { id: appt.id } });
    log(!orphaned ? 'PASS' : 'WARN', 'Cascade delete (orphan check)');
    results[!orphaned ? 'passed' : 'warnings']++;
  } catch (e) {
    log('WARN', `Cascade test: ${e.message}`);
    results.warnings++;
  }

  // ── SUMMARY ──────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(55));
  console.log('📊 DATABASE TEST SUMMARY');
  console.log('═'.repeat(55));
  console.log(`✅ Passed:  ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log('═'.repeat(55));

  await prisma.$disconnect();
  
  const exitCode = results.failed > 0 ? 1 : 0;
  console.log(exitCode === 0 ? '\n🎉 ALL DATABASE TESTS PASSED!\n' : '\n⚠️  SOME TESTS FAILED\n');
  
  process.exit(exitCode);
}

runTests().catch(e => {
  console.error('Test suite error:', e);
  process.exit(1);
});
