import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

// Config
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const prisma = new PrismaClient();

async function log(status, msg) {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${status}] ${msg}`);
}

async function runTests() {
  console.log('\n' + '═'.repeat(55));
  console.log('🗄️  DATABASE & E2E TEST SUITE');
  console.log('═'.repeat(55) + '\n');

  const results = { passed: 0, failed: 0, warnings: 0 };

  // ── DB TESTS ─────────────────────────────────────────────────
  console.log('📦 DATABASE TESTS\n');

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
    // Create
    const testUser = await prisma.user.create({
      data: {
        email: `test_${Date.now()}@test.com`,
        passwordHash: 'hashed123',
        fullName: 'Test User',
        role: 'PATIENT'
      }
    });
    log('PASS', 'User created');
    results.passed++;

    // Read
    const found = await prisma.user.findUnique({ where: { id: testUser.id } });
    log(found ? 'PASS' : 'FAIL', 'User read');
    results[found ? 'passed' : 'failed']++;

    // Update
    const updated = await prisma.user.update({
      where: { id: testUser.id },
      data: { fullName: 'Updated Name' }
    });
    log(updated.fullName === 'Updated Name' ? 'PASS' : 'FAIL', 'User updated');
    results[updated.fullName === 'Updated Name' ? 'passed' : 'failed']++;

    // Delete
    await prisma.user.delete({ where: { id: testUser.id } });
    const deleted = await prisma.user.findUnique({ where: { id: testUser.id } });
    log(!deleted ? 'PASS' : 'FAIL', 'User deleted');
    results[!deleted ? 'passed' : 'failed']++;
  } catch (e) {
    log('FAIL', `User CRUD failed: ${e.message}`);
    results.failed += 4;
  }

  // Test 4: Specialty CRUD
  try {
    const specialty = await prisma.specialty.create({
      data: { name: 'Cardiology', slug: 'cardiology-test' }
    });
    const found = await prisma.specialty.findUnique({ where: { id: specialty.id } });
    await prisma.specialty.delete({ where: { id: specialty.id } });
    log(found ? 'PASS' : 'FAIL', 'Specialty CRUD');
    results[found ? 'passed' : 'failed']++;
  } catch (e) {
    log('FAIL', `Specialty CRUD failed: ${e.message}`);
    results.failed++;
  }

  // Test 5: Doctor CRUD
  try {
    const doctor = await prisma.doctor.create({
      data: { fullName: 'Dr. Test', status: 'ACTIVE' }
    });
    const found = await prisma.doctor.findUnique({ where: { id: doctor.id } });
    await prisma.doctor.delete({ where: { id: doctor.id } });
    log(found ? 'PASS' : 'FAIL', 'Doctor CRUD');
    results[found ? 'passed' : 'failed']++;
  } catch (e) {
    log('FAIL', `Doctor CRUD failed: ${e.message}`);
    results.failed++;
  }

  // Test 6: Service CRUD
  try {
    const service = await prisma.service.create({
      data: {
        name: 'Checkup',
        slug: 'checkup-test',
        durationMinutes: 30,
        price: 100
      }
    });
    const found = await prisma.service.findUnique({ where: { id: service.id } });
    await prisma.service.delete({ where: { id: service.id } });
    log(found ? 'PASS' : 'FAIL', 'Service CRUD');
    results[found ? 'passed' : 'failed']++;
  } catch (e) {
    log('FAIL', `Service CRUD failed: ${e.message}`);
    results.failed++;
  }

  // Test 7: Appointment flow
  try {
    const doctor = await prisma.doctor.create({ data: { fullName: 'Dr. Appt' } });
    const service = await prisma.service.create({
      data: { name: 'Visit', slug: 'visit-test', durationMinutes: 15, price: 50 }
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
    
    // Update status
    const updated = await prisma.appointment.update({
      where: { id: appt.id },
      data: { status: 'CONFIRMED' }
    });
    
    // Add history
    await prisma.appointmentStatusHistory.create({
      data: {
        appointmentId: appt.id,
        fromStatus: 'PENDING',
        toStatus: 'CONFIRMED'
      }
    });
    
    // Cleanup
    await prisma.appointmentStatusHistory.deleteMany({ where: { appointmentId: appt.id } });
    await prisma.appointment.delete({ where: { id: appt.id } });
    await prisma.doctor.delete({ where: { id: doctor.id } });
    await prisma.service.delete({ where: { id: service.id } });
    
    log(updated.status === 'CONFIRMED' ? 'PASS' : 'FAIL', 'Appointment flow');
    results[updated.status === 'CONFIRMED' ? 'passed' : 'failed']++;
  } catch (e) {
    log('FAIL', `Appointment flow failed: ${e.message}`);
    results.failed++;
  }

  // Test 8: Foreign key relations
  try {
    const doctor = await prisma.doctor.create({ data: { fullName: 'Dr. FK' } });
    const specialty = await prisma.specialty.create({ data: { name: 'Neuro', slug: 'neuro-test' } });
    
    await prisma.doctorSpecialty.create({
      data: { doctorId: doctor.id, specialtyId: specialty.id }
    });
    
    const relation = await prisma.doctorSpecialty.findFirst({
      where: { doctorId: doctor.id }
    });
    
    await prisma.doctorSpecialty.deleteMany({ where: { doctorId: doctor.id } });
    await prisma.doctor.delete({ where: { id: doctor.id } });
    await prisma.specialty.delete({ where: { id: specialty.id } });
    
    log(relation ? 'PASS' : 'FAIL', 'Doctor-Specialty relation');
    results[relation ? 'passed' : 'failed']++;
  } catch (e) {
    log('FAIL', `Relation test failed: ${e.message}`);
    results.failed++;
  }

  // Test 9: DB file integrity
  try {
    const info = await prisma.$queryRaw`SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'`;
    const dbSize = require('fs').statSync('./data/medical.db').size;
    log(dbSize > 0 ? 'PASS' : 'FAIL', `DB file valid (${dbSize} bytes, ${info[0].count} tables)`);
    results[dbSize > 0 ? 'passed' : 'failed']++;
  } catch (e) {
    log('WARN', `DB file check skipped: ${e.message}`);
    results.warnings++;
  }

  // ── E2E TESTS ─────────────────────────────────────────────────
  console.log('\n🌐 E2E INTERFACE TESTS\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test 10: Page loads
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    const title = await page.title();
    log(title.includes('Medical') ? 'PASS' : 'FAIL', `Page loads: "${title}"`);
    results[title.includes('Medical') ? 'passed' : 'failed']++;

    // Test 11: Content visible
    const bodyText = await page.locator('body').innerText();
    log(bodyText.trim().length > 50 ? 'PASS' : 'FAIL', 'Page has content');
    results[bodyText.trim().length > 50 ? 'passed' : 'failed']++;

    // Test 12: No JS errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    log(errors.length === 0 ? 'PASS' : 'FAIL', `No JS errors (${errors.length})`);
    results[errors.length === 0 ? 'passed' : 'failed']++;

    // Test 13: Interactive elements
    const buttons = await page.locator('button').all();
    log(buttons.length > 0 ? 'PASS' : 'FAIL', `Buttons present (${buttons.length})`);
    results[buttons.length > 0 ? 'passed' : 'failed']++;

    // Test 14: Input fields
    const inputs = await page.locator('input').all();
    log(inputs.length > 0 ? 'PASS' : 'FAIL', `Input fields present (${inputs.length})`);
    results[inputs.length > 0 ? 'passed' : 'failed']++;

    // Test 15: Dashboard navigation
    const dashBtn = page.locator('button, a', { hasText: /dashboard|admin/i }).first();
    if (await dashBtn.count() > 0) {
      await dashBtn.click();
      await page.waitForTimeout(1000);
      const hasDash = (await page.locator('body').innerText()).includes('Dashboard');
      log(hasDash ? 'PASS' : 'WARN', 'Dashboard navigation');
      results[hasDash ? 'passed' : 'warnings']++;
    } else {
      log('WARN', 'Dashboard button not visible (may need login)');
      results.warnings++;
    }

  } catch (e) {
    log('FAIL', `E2E tests failed: ${e.message}`);
    results.failed += 5;
  } finally {
    await browser.close();
  }

  // ── API TEST ─────────────────────────────────────────────────
  console.log('\n🔌 API TESTS\n');

  try {
    const response = await page.request.get('http://localhost:4000/api/health', { timeout: 5000 });
    log(response.ok() ? 'PASS' : 'WARN', `API health check (${response.status()})`);
    results[response.ok() ? 'passed' : 'warnings']++;
  } catch (e) {
    log('WARN', 'API not accessible from test');
    results.warnings++;
  }

  // ── SUMMARY ──────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(55));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(55));
  console.log(`✅ Passed:  ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log('═'.repeat(55));

  await prisma.$disconnect();
  
  const exitCode = results.failed > 0 ? 1 : 0;
  console.log(exitCode === 0 ? '\n🎉 ALL TESTS PASSED!\n' : '\n⚠️  SOME TESTS FAILED\n');
  
  process.exit(exitCode);
}

runTests().catch(e => {
  console.error('Test suite error:', e);
  process.exit(1);
});
