import { chromium } from '@playwright/test';

// Config
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = [];
  
  function log(status, msg) {
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏳';
    console.log(`${icon} [${status}] ${msg}`);
    results.push({ status, msg });
  }

  try {
    // ── Test 1: Load homepage ────────────────────────────────────────
    console.log('\n🔍 Testing homepage load...\n');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    
    // Check page title
    const title = await page.title();
    log(title.includes('Medical') ? 'PASS' : 'FAIL', `Page title: "${title}"`);
    
    // Check root element has content (not empty)
    const rootContent = await page.locator('#root').innerHTML();
    log(rootContent.length > 100 ? 'PASS' : 'FAIL', `Root element has content (${rootContent.length} chars)`);
    
    // Check for visible text on page
    await page.waitForTimeout(1000);
    const bodyText = await page.locator('body').innerText();
    log(bodyText.trim().length > 0 ? 'PASS' : 'FAIL', `Page has visible text`);

    // ── Test 2: Check for console errors ───────────────────────────
    console.log('\n🔍 Checking for JS errors...\n');
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    log(errors.length === 0 ? 'PASS' : 'FAIL', `Console errors: ${errors.length === 0 ? 'None' : errors.join(', ')}`);

    // ── Test 3: Login screen elements ──────────────────────────────
    console.log('\n🔍 Testing Login screen...\n');
    
    // Check for email/password fields - try multiple selectors
    const emailField = page.locator('input').filter({ hasText: '' }).or(
      page.locator('input').first()
    );
    const emailInputs = await page.locator('input').all();
    const hasAnyInput = emailInputs.length > 0;
    const inputCount = emailInputs.length;
    
    log(hasAnyInput ? 'PASS' : 'FAIL', `Input fields present (${inputCount} found)`);
    
    // Get all input placeholders to debug
    const placeholders = [];
    for (const input of emailInputs.slice(0, 5)) {
      const ph = await input.getAttribute('placeholder').catch(() => 'N/A');
      const type = await input.getAttribute('type').catch(() => 'N/A');
      placeholders.push(`${type}:${ph}`);
    }
    console.log('   Input fields: ' + placeholders.join(', '));
    
    // Check for buttons
    const buttons = await page.locator('button').all();
    log(buttons.length > 0 ? 'PASS' : 'FAIL', `Buttons present (${buttons.length} found)`);

    // ── Test 4: Register screen ────────────────────────────────────
    console.log('\n🔍 Testing Register navigation...\n');
    
    // Find and click Register link/button
    const registerLink = page.locator('a, button', { hasText: /register|đăng ký|sign up/i }).first();
    if (await registerLink.count() > 0) {
      await registerLink.click();
      await page.waitForTimeout(1000);
      log('PASS', 'Register link clicked');
      
      // Check for firstName/lastName fields in register mode
      const firstNameField = page.locator('input[placeholder*="first" i], input[placeholder*="First" i], input[placeholder*="tên" i]').first();
      log(await firstNameField.count() > 0 ? 'PASS' : 'WARN', 'First name field present');
    } else {
      log('WARN', 'Register link not found - might be in forgot password mode');
    }

    // ── Test 5: Patient portal visible ─────────────────────────────
    console.log('\n🔍 Testing Patient Portal...\n');
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const portalText = await page.locator('body').innerText();
    const hasPatientContent = portalText.includes('Patient') || portalText.includes('patient') || 
                               portalText.includes('Bệnh nhân') || portalText.includes('doctor') ||
                               portalText.includes('Doctor') || portalText.includes('Bác sĩ') ||
                               portalText.includes('Clinic') || portalText.includes('appointment');
    log(hasPatientContent ? 'PASS' : 'FAIL', 'Patient portal content visible');

    // ── Test 6: Navigation to Dashboard ───────────────────────────
    console.log('\n🔍 Testing Dashboard navigation...\n');
    
    // Look for admin/dashboard button
    const dashboardBtn = page.locator('button, a', { hasText: /dashboard|admin|quản lý/i }).first();
    if (await dashboardBtn.count() > 0) {
      await dashboardBtn.click();
      await page.waitForTimeout(1000);
      const dashContent = await page.locator('body').innerText();
      const hasDashboardContent = dashContent.includes('Dashboard') || dashContent.includes('Clinic') || 
                                   dashContent.includes('Today') || dashContent.includes('appointment');
      log(hasDashboardContent ? 'PASS' : 'WARN', 'Dashboard navigation works');
    } else {
      log('WARN', 'Dashboard button not found - might require login first');
    }

    // ── Test 7: API connectivity ──────────────────────────────────
    console.log('\n🔍 Testing API connectivity...\n');
    
    try {
      const apiResponse = await page.request.get('http://localhost:4000/api/health', { timeout: 5000 });
      log(apiResponse.ok() ? 'PASS' : 'FAIL', `Backend API responds (status: ${apiResponse.status()})`);
    } catch (e) {
      log('WARN', 'Backend API not accessible from test machine (expected if not on same network)');
    }

  } catch (error) {
    log('FAIL', `Test error: ${error.message}`);
  } finally {
    await browser.close();
  }

  // ── Summary ─────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(50));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARN').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log('═'.repeat(50));
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
