import { runTests as runRealE2ETests } from './real-e2e.spec.js';
import { runTests as runAdminTests } from './admin.spec.js';
import { runTests as runPatientTests } from './patient.spec.js';
import { runTests as runAuthTests } from './auth.spec.js';

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     Selenium E2E Test Runner - Medical Appointment        ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  let totalPassed = 0;
  let totalFailed = 0;

  try {
    // Run Real E2E Tests first (auth flow tests)
    const realE2EResults = await runRealE2ETests();
    totalPassed += realE2EResults.passed;
    totalFailed += realE2EResults.failed;
    console.log('');
  } catch (e) {
    console.log('Real E2E tests error:', e.message);
  }

  try {
    // Run Authentication Tests
    const authResults = await runAuthTests();
    totalPassed += authResults.passed;
    totalFailed += authResults.failed;
    console.log('');
  } catch (e) {
    console.log('Auth tests error:', e.message);
  }

  try {
    // Run Admin Dashboard Tests
    const adminResults = await runAdminTests();
    totalPassed += adminResults.passed;
    totalFailed += adminResults.failed;
    console.log('');
  } catch (e) {
    console.log('Admin tests error:', e.message);
  }

  try {
    // Run Patient Portal Tests
    const patientResults = await runPatientTests();
    totalPassed += patientResults.passed;
    totalFailed += patientResults.failed;
    console.log('');
  } catch (e) {
    console.log('Patient tests error:', e.message);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('                 FINAL TEST RESULTS');
  console.log('═'.repeat(60));
  console.log(`  Total Passed:  ${totalPassed}`);
  console.log(`  Total Failed:  ${totalFailed}`);
  console.log(`  Success Rate:  ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  console.log('═'.repeat(60));

  if (totalFailed === 0) {
    console.log('\n🎉 All tests passed!\n');
  } else {
    console.log(`\n⚠️  ${totalFailed} test(s) failed. Please review the output above.\n`);
  }
}

main().catch(console.error);
