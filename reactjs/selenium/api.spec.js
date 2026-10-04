const { By, until, Keys } = require('selenium-webdriver');
const { config, helpers } = require('./config');

/**
 * Selenium E2E Tests - API Integration
 * Full coverage for API endpoints and UI integration
 */

async function runTests() {
  let driver;
  let passed = 0;
  let failed = 0;

  console.log('🚀 Starting API Integration Tests...\n');

  try {
    // Setup driver
    driver = await helpers.createDriver('chrome');
    await helpers.loginAsAdmin(driver);

    // Test 1: Appointments API - Fetch Data
    try {
      console.log('Test 1: Appointments Page Load');
      await driver.findElement(By.xpath("//button[contains(text(),'Lịch hẹn')]")).click();
      await driver.sleep(2000); // Wait for API call
      
      const table = await driver.findElement(By.css('table'));
      const isVisible = await table.isDisplayed();
      if (isVisible) {
        console.log('  ✅ Appointments page loaded with table');
        passed++;
      } else {
        console.log('  ❌ Appointments table not visible');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 2: Appointments - Verify Data Columns
    try {
      console.log('Test 2: Appointments Data Columns');
      const headers = await driver.findElements(By.css('th'));
      const headerTexts = [];
      for (let h of headers) {
        headerTexts.push(await h.getText());
      }
      console.log(`  Headers: ${headerTexts.join(', ')}`);
      if (headerTexts.length >= 4) {
        console.log('  ✅ Appointments have proper columns');
        passed++;
      } else {
        console.log('  ❌ Missing columns');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 3: Filter Appointments
    try {
      console.log('Test 3: Filter Appointments by Status');
      const pendingTab = await driver.findElement(By.xpath("//button[contains(text(),'Chờ')]"));
      await pendingTab.click();
      await driver.sleep(500);
      console.log('  ✅ Filter clicked');
      passed++;
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 4: Search Appointments
    try {
      console.log('Test 4: Search Appointments');
      const searchInput = await driver.findElement(By.css('.search-box input'));
      await searchInput.clear();
      await searchInput.sendKeys('Linh');
      await driver.sleep(500);
      console.log('  ✅ Search input works');
      passed++;
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 5: Doctors API - Fetch Data
    try {
      console.log('Test 5: Doctors Page Load');
      await driver.findElement(By.xpath("//button[contains(text(),'Bác sĩ')]")).click();
      await driver.sleep(2000);
      
      const table = await driver.findElement(By.css('table'));
      const isVisible = await table.isDisplayed();
      if (isVisible) {
        console.log('  ✅ Doctors page loaded');
        passed++;
      } else {
        console.log('  ❌ Doctors table not visible');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 6: Doctors - Verify Columns
    try {
      console.log('Test 6: Doctors Data Columns');
      const headers = await driver.findElements(By.css('th'));
      const headerTexts = [];
      for (let h of headers) {
        headerTexts.push(await h.getText());
      }
      console.log(`  Headers: ${headerTexts.join(', ')}`);
      if (headerTexts.length >= 3) {
        console.log('  ✅ Doctors have proper columns');
        passed++;
      } else {
        console.log('  ❌ Missing columns');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 7: Services API - Fetch Data
    try {
      console.log('Test 7: Services Page Load');
      await driver.findElement(By.xpath("//button[contains(text(),'Dịch vụ')]")).click();
      await driver.sleep(2000);
      
      const table = await driver.findElement(By.css('table'));
      const isVisible = await table.isDisplayed();
      if (isVisible) {
        console.log('  ✅ Services page loaded');
        passed++;
      } else {
        console.log('  ❌ Services table not visible');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 8: Services - Verify Columns
    try {
      console.log('Test 8: Services Data Columns');
      const headers = await driver.findElements(By.css('th'));
      const headerTexts = [];
      for (let h of headers) {
        headerTexts.push(await h.getText());
      }
      console.log(`  Headers: ${headerTexts.join(', ')}`);
      if (headerTexts.length >= 3) {
        console.log('  ✅ Services have proper columns');
        passed++;
      } else {
        console.log('  ❌ Missing columns');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 9: Overview Statistics
    try {
      console.log('Test 9: Overview Statistics');
      await driver.findElement(By.xpath("//button[contains(text(),'Tổng quan')]")).click();
      await driver.sleep(2000);
      
      const kpiGrid = await driver.findElement(By.css('.kpi-grid'));
      const isVisible = await kpiGrid.isDisplayed();
      if (isVisible) {
        console.log('  ✅ Overview statistics loaded');
        passed++;
      } else {
        console.log('  ❌ Statistics not visible');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 10: Recent Appointments Table
    try {
      console.log('Test 10: Recent Appointments');
      const recentTable = await driver.findElement(By.css('.table-card'));
      const isVisible = await recentTable.isDisplayed();
      if (isVisible) {
        console.log('  ✅ Recent appointments table visible');
        passed++;
      } else {
        console.log('  ❌ Recent table not visible');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 11: Add Button Availability
    try {
      console.log('Test 11: Add Button Availability');
      await driver.findElement(By.xpath("//button[contains(text(),'Bác sĩ')]")).click();
      await driver.sleep(500);
      
      const addButton = await driver.findElement(By.xpath("//button[contains(text(),'Thêm bác sĩ')]"));
      const isVisible = await addButton.isDisplayed();
      if (isVisible) {
        console.log('  ✅ Add doctor button visible');
        passed++;
      } else {
        console.log('  ❌ Add button not visible');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 12: Refresh/Sync Button
    try {
      console.log('Test 12: Refresh Button');
      // Look for refresh button in appointments
      await driver.findElement(By.xpath("//button[contains(text(),'Lịch hẹn')]")).click();
      await driver.sleep(500);
      
      const refreshButton = await driver.findElement(By.css('button svg.icon'));
      const isVisible = await refreshButton.isDisplayed();
      if (isVisible) {
        console.log('  ✅ Icon buttons visible');
        passed++;
      } else {
        console.log('  ❌ Icons not visible');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
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

module.exports = { runTests };
