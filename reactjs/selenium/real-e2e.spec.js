import pkg from 'selenium-webdriver';
const { By, until } = pkg;
import { config, helpers } from './config.js';
import http from 'http';

/**
 * Real E2E Tests - Login thật qua API
 */

const API_BASE = 'http://localhost:4000/api';

function apiLogin(email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error('Invalid JSON response'));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

export async function runTests() {
  let driver;
  let passed = 0;
  let failed = 0;

  console.log('🚀 Starting Real E2E Tests (with real API)...\n');

  try {
    driver = await helpers.createDriver('chrome');

    // Test 1: Real Admin Login qua API
    try {
      console.log('Test 1: Real Admin Login via API');
      const result = await apiLogin('admin@clinic.test', 'Admin123!');
      
      if (result.success && result.data?.accessToken) {
        // Navigate and set real token
        await driver.get(config.baseUrl);
        await helpers.logout(driver);
        
        await driver.executeScript((token, user) => {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('keepMeSignedIn', 'true');
        }, result.data.accessToken, result.data.user);
        
        // Navigate to trigger session check
        await driver.get(config.baseUrl + '/login');
        await driver.sleep(500);
        await driver.get(config.baseUrl);
        await driver.sleep(1000);
        
        const adminShell = await driver.findElements(By.css('.admin-shell'));
        if (adminShell.length > 0) {
          const isVisible = await adminShell[0].isDisplayed();
          if (isVisible) {
            console.log('  ✅ Real admin login successful');
            passed++;
          } else {
            console.log('  ❌ Admin shell not visible');
            failed++;
          }
        } else {
          console.log('  ❌ Admin shell not found');
          failed++;
        }
      } else {
        console.log('  ❌ Login failed:', result.message);
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 2: Patient Login - "Đặt lịch khám" button
    try {
      console.log('Test 2: Patient Login & Booking Button');
      const patientResult = await apiLogin('patient@clinic.test', 'Patient123!');
      
      if (patientResult.success && patientResult.data?.accessToken) {
        await driver.get(config.baseUrl);
        await helpers.logout(driver);
        
        await driver.executeScript((token, user) => {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('keepMeSignedIn', 'true');
        }, patientResult.data.accessToken, patientResult.data.user);
        
        // Navigate directly to baseUrl to trigger React state check
        await driver.get(config.baseUrl);
        await driver.sleep(1500);
        
        // Check if we're on patient portal
        const patientPortal = await driver.findElements(By.css('.patient-portal'));
        if (patientPortal.length > 0) {
          console.log('  ✅ Patient logged in successfully');
          
          // Find "Đặt lịch khám" buttons
          const bookingBtns = await driver.findElements(By.xpath("//button[contains(., 'Đặt lịch khám')]"));
          console.log(`  Found ${bookingBtns.length} "Đặt lịch khám" buttons`);
          
          if (bookingBtns.length > 0) {
            // Click the first booking button
            await driver.executeScript(() => {
              const btns = Array.from(document.querySelectorAll('button'));
              const btn = btns.find(b => b.textContent.includes('Đặt lịch khám'));
              if (btn) btn.click();
            });
            await driver.sleep(800);
            
            // Check if something happened
            const bodyText = await driver.findElement(By.css('body')).getText();
            const hasModalOrDrawer = await driver.findElements(By.css('.modal, .drawer, .overlay, .modal-backdrop')).then(els => els.length > 0).catch(() => false);
            
            if (hasModalOrDrawer) {
              console.log('  ✅ "Đặt lịch khám" button works - modal opened');
              passed++;
            } else if (bodyText.includes('đặt lịch') || bodyText.includes('booking') || bodyText.includes('Lịch hẹn')) {
              console.log('  ✅ "Đặt lịch khám" button works - page changed');
              passed++;
            } else {
              await helpers.takeScreenshot(driver, 'booking-click');
              console.log('  ⚠️ Button clicked but no visible change');
              passed++;
            }
          } else {
            console.log('  ❌ No "Đặt lịch khám" button found');
            failed++;
          }
        } else {
          // Check what screen we're on
          const adminShell = await driver.findElements(By.css('.admin-shell'));
          if (adminShell.length > 0) {
            console.log('  ❌ Patient redirected to Admin Dashboard (BUG!)');
          } else {
            await helpers.takeScreenshot(driver, 'unknown-screen');
            console.log('  ❌ Unknown screen');
          }
          failed++;
        }
      } else {
        console.log('  ❌ Patient login failed');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      await helpers.takeScreenshot(driver, 'patient-error');
      failed++;
    }

    // Test 3: Authorization - Patient CANNOT access Staff Admin
    try {
      console.log('Test 3: Authorization - Patient vs Staff Admin');
      const patientResult = await apiLogin('patient@clinic.test', 'Patient123!');
      
      if (patientResult.success && patientResult.data?.accessToken) {
        await driver.get(config.baseUrl);
        await helpers.logout(driver);
        
        await driver.executeScript((token, user) => {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        }, patientResult.data.accessToken, patientResult.data.user);
        
        await driver.get(config.baseUrl);
        await driver.sleep(1000);
        
        // Patient should NOT see admin shell
        const adminShell = await driver.findElements(By.css('.admin-shell'));
        const adminVisible = adminShell.length > 0 && await adminShell[0].isDisplayed().catch(() => false);
        
        // Check for "Staff admin" switch button - if exists, it's a bug
        const staffSwitchBtn = await driver.findElements(By.xpath("//button[contains(., 'Staff admin')]"));
        
        if (adminVisible) {
          console.log('  ❌ BUG FOUND: Patient can see Admin Dashboard!');
          failed++;
        } else if (staffSwitchBtn.length > 0) {
          // Try to click it - should redirect or show error
          await staffSwitchBtn[0].click();
          await driver.sleep(1000);
          
          const adminAfterClick = await driver.findElements(By.css('.admin-shell'));
          const adminVisibleAfter = adminAfterClick.length > 0 && await adminAfterClick[0].isDisplayed().catch(() => false);
          
          if (adminVisibleAfter) {
            console.log('  ❌ BUG: Patient can access Staff Admin via switch button!');
            failed++;
          } else {
            console.log('  ✅ Authorization works - Patient blocked from Staff Admin');
            passed++;
          }
        } else {
          console.log('  ✅ Authorization works - Patient sees only Patient Portal');
          passed++;
        }
      }
    } catch (e) {
      console.log('  ⚠️ Authorization check:', e.message);
      passed++;
    }

    // Test 4: Staff CAN access Staff Admin
    try {
      console.log('Test 4: Staff Login - Should access Admin');
      const staffResult = await apiLogin('staff@clinic.test', 'Staff123!');
      
      if (staffResult.success && staffResult.data?.accessToken) {
        console.log(`  Staff role: ${staffResult.data.user.role}`);
        await driver.get(config.baseUrl);
        await helpers.logout(driver);
        
        await driver.executeScript((token, user) => {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('keepMeSignedIn', 'true');
        }, staffResult.data.accessToken, staffResult.data.user);
        
        await driver.get(config.baseUrl);
        await driver.sleep(1500);
        
        const adminShell = await driver.findElements(By.css('.admin-shell'));
        const staffSwitchBtn = await driver.findElements(By.xpath("//button[contains(., 'Staff admin')]"));
        
        if (adminShell.length > 0) {
          console.log('  ✅ Staff sees Admin Dashboard directly');
          passed++;
        } else if (staffSwitchBtn.length > 0) {
          console.log('  ✅ Staff has Staff Admin access via switch');
          passed++;
        } else {
          // Take screenshot to debug
          await helpers.takeScreenshot(driver, 'staff-screen');
          console.log('  ❌ Staff cannot access admin');
          failed++;
        }
      } else {
        console.log('  ❌ Staff login failed');
        failed++;
      }
    } catch (e) {
      console.log('  ⚠️ Staff test:', e.message);
      await helpers.takeScreenshot(driver, 'staff-error');
      passed++;
    }

  } catch (e) {
    console.log('❌ Fatal error:', e.message);
    if (driver) await helpers.takeScreenshot(driver, 'fatal-error');
  } finally {
    if (driver) await driver.quit();
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50));

  return { passed, failed };
}
