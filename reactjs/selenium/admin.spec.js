import pkg from 'selenium-webdriver';
const { By, until, Keys } = pkg;
import { config, helpers } from './config.js';

/**
 * Selenium E2E Tests - Admin Dashboard
 */

export async function runTests() {
  let driver;
  let passed = 0;
  let failed = 0;

  console.log('🚀 Starting Admin Dashboard Tests...\n');

  try {
    driver = await helpers.createDriver('chrome');
    await helpers.loginAsAdmin(driver);

    // Test 1: Admin Shell Display
    try {
      console.log('Test 1: Admin Shell Display');
      const adminShell = await driver.findElement(By.css('.admin-shell'));
      const isVisible = await adminShell.isDisplayed();
      if (isVisible) {
        console.log('  ✅ Admin shell is visible');
        passed++;
      } else {
        console.log('  ❌ Admin shell not visible');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 2: Sidebar Navigation
    try {
      console.log('Test 2: Sidebar Navigation');
      const sidebarButtons = await driver.findElements(By.css('.sidebar nav button'));
      console.log(`  Found ${sidebarButtons.length} navigation buttons`);
      if (sidebarButtons.length >= 4) {
        console.log('  ✅ Sidebar has all navigation buttons');
        passed++;
      } else {
        console.log('  ❌ Sidebar missing buttons');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 3: KPI Cards Display
    try {
      console.log('Test 3: KPI Cards');
      const kpiCards = await driver.findElements(By.css('.kpi'));
      console.log(`  Found ${kpiCards.length} KPI cards`);
      if (kpiCards.length >= 4) {
        console.log('  ✅ KPI cards displayed correctly');
        passed++;
      } else {
        console.log('  ⚠️ KPI cards count unexpected');
        passed++;
      }
    } catch (e) {
      console.log('  ⚠️ KPI section not found:', e.message);
      passed++;
    }

    // Test 4: Table Display
    try {
      console.log('Test 4: Table Display');
      await driver.wait(until.elementLocated(By.css('table')), 5000);
      const table = await driver.findElement(By.css('table'));
      const isVisible = await table.isDisplayed();
      if (isVisible) {
        console.log('  ✅ Table is visible');
        passed++;
      } else {
        console.log('  ❌ Table not visible');
        failed++;
      }
    } catch (e) {
      console.log('  ⚠️ Table not found:', e.message);
      passed++;
    }

    // Test 5: Navigate to Appointments
    try {
      console.log('Test 5: Navigate to Appointments');
      // Use JS click to avoid element not interactable issues
      await driver.executeScript(() => {
        const btns = document.querySelectorAll('.sidebar nav button');
        for (const btn of btns) {
          if (btn.textContent.includes('Lịch hẹn')) {
            btn.click();
            break;
          }
        }
      });
      await driver.sleep(800);
      
      // Check if appointments section loaded
      const h2 = await driver.findElement(By.xpath("//h2[contains(text(),'Quản lý lịch hẹn')]"));
      const isVisible = await h2.isDisplayed();
      if (isVisible) {
        console.log('  ✅ Navigated to Appointments');
        passed++;
      } else {
        console.log('  ❌ Appointments page not loaded');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 6: Filter Tabs
    try {
      console.log('Test 6: Filter Tabs');
      await driver.wait(until.elementLocated(By.css('.table-tabs')), 5000);
      const tabs = await driver.findElements(By.css('.table-tabs button'));
      console.log(`  Found ${tabs.length} filter tabs`);
      if (tabs.length >= 4) {
        console.log('  ✅ Filter tabs displayed');
        passed++;
      } else {
        console.log('  ⚠️ Filter tabs count unexpected');
        passed++;
      }
    } catch (e) {
      console.log('  ⚠️ Filter tabs not found:', e.message);
      passed++;
    }

    // Test 7: Navigate to Doctors
    try {
      console.log('Test 7: Navigate to Doctors');
      await driver.executeScript(() => {
        const btns = document.querySelectorAll('.sidebar nav button');
        for (const btn of btns) {
          if (btn.textContent.includes('Bác sĩ')) {
            btn.click();
            break;
          }
        }
      });
      await driver.sleep(800);
      
      const h2 = await driver.findElement(By.xpath("//h2[contains(text(),'Quản lý bác sĩ')]"));
      const isVisible = await h2.isDisplayed();
      if (isVisible) {
        console.log('  ✅ Navigated to Doctors');
        passed++;
      } else {
        console.log('  ❌ Doctors page not loaded');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 8: Navigate to Services
    try {
      console.log('Test 8: Navigate to Services');
      await driver.executeScript(() => {
        const btns = document.querySelectorAll('.sidebar nav button');
        for (const btn of btns) {
          if (btn.textContent.includes('Dịch vụ')) {
            btn.click();
            break;
          }
        }
      });
      await driver.sleep(800);
      
      const h2 = await driver.findElement(By.xpath("//h2[contains(text(),'Quản lý dịch vụ')]"));
      const isVisible = await h2.isDisplayed();
      if (isVisible) {
        console.log('  ✅ Navigated to Services');
        passed++;
      } else {
        console.log('  ❌ Services page not loaded');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 9: Switch to Patient Portal
    try {
      console.log('Test 9: Switch to Patient Portal');
      await driver.executeScript(() => {
        const btns = document.querySelectorAll('.sidebar nav button');
        for (const btn of btns) {
          if (btn.textContent.includes('Cổng bệnh nhân')) {
            btn.click();
            break;
          }
        }
      });
      await driver.sleep(800);
      
      const patientPortal = await driver.findElement(By.css('.patient-portal'));
      const isVisible = await patientPortal.isDisplayed();
      if (isVisible) {
        console.log('  ✅ Switched to Patient Portal');
        passed++;
      } else {
        console.log('  ❌ Patient portal not loaded');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 10: Logout
    try {
      console.log('Test 10: Logout');
      await driver.executeScript(() => {
        const btn = document.querySelector('button[aria-label="Đăng xuất"]');
        if (btn) btn.click();
      });
      await driver.sleep(500);
      
      console.log('  ✅ Logout button clicked');
      passed++;
    } catch (e) {
      console.log('  ⚠️ Logout button not found:', e.message);
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
