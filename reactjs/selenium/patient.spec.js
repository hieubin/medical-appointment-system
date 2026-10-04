import pkg from 'selenium-webdriver';
const { By, until, Keys } = pkg;
import { config, helpers } from './config.js';

/**
 * Selenium E2E Tests - Patient Portal
 */

export async function runTests() {
  let driver;
  let passed = 0;
  let failed = 0;

  console.log('🚀 Starting Patient Portal Tests...\n');

  try {
    driver = await helpers.createDriver('chrome');
    await helpers.loginAsPatient(driver);

    // Test 1: Patient Portal Display
    try {
      console.log('Test 1: Patient Portal Display');
      const patientPortal = await driver.findElement(By.css('.patient-portal'));
      const isVisible = await patientPortal.isDisplayed();
      if (isVisible) {
        console.log('  ✅ Patient portal is visible');
        passed++;
      } else {
        console.log('  ❌ Patient portal not visible');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 2: Header with Logo
    try {
      console.log('Test 2: Header with Logo');
      const brand = await driver.findElement(By.css('.brand'));
      const isVisible = await brand.isDisplayed();
      if (isVisible) {
        console.log('  ✅ Logo is visible');
        passed++;
      } else {
        console.log('  ❌ Logo not visible');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 3: Navigation Links
    try {
      console.log('Test 3: Navigation Links');
      const navLinks = await driver.findElements(By.css('nav a'));
      console.log(`  Found ${navLinks.length} navigation links`);
      if (navLinks.length >= 3) {
        console.log('  ✅ Navigation links displayed');
        passed++;
      } else {
        console.log('  ❌ Navigation missing links');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 4: Welcome Section
    try {
      console.log('Test 4: Welcome Section');
      const welcome = await driver.findElement(By.css('.patient-welcome'));
      const isVisible = await welcome.isDisplayed();
      if (isVisible) {
        console.log('  ✅ Welcome section visible');
        passed++;
      } else {
        console.log('  ❌ Welcome section not visible');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 5: Search Section
    try {
      console.log('Test 5: Search Section');
      const search = await driver.findElement(By.css('.patient-search'));
      const isVisible = await search.isDisplayed();
      if (isVisible) {
        console.log('  ✅ Search section visible');
        passed++;
      } else {
        console.log('  ❌ Search section not visible');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 6: Search Input
    try {
      console.log('Test 6: Search Input');
      const searchInput = await driver.findElement(By.css('.patient-search input'));
      await searchInput.sendKeys('Tim mạch');
      const value = await searchInput.getAttribute('value');
      if (value === 'Tim mạch') {
        console.log('  ✅ Search input works');
        passed++;
      } else {
        console.log('  ❌ Search input failed');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 7: Patient Grid Cards
    try {
      console.log('Test 7: Patient Grid Cards');
      const gridCards = await driver.findElements(By.css('.patient-card'));
      console.log(`  Found ${gridCards.length} cards`);
      if (gridCards.length >= 3) {
        console.log('  ✅ Patient cards displayed');
        passed++;
      } else {
        console.log('  ⚠️ Cards count unexpected');
        passed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 8: Quick Actions
    try {
      console.log('Test 8: Quick Actions');
      const quickActions = await driver.findElement(By.css('.portal-quick-actions'));
      const isVisible = await quickActions.isDisplayed();
      if (isVisible) {
        console.log('  ✅ Quick actions visible');
        passed++;
      } else {
        console.log('  ❌ Quick actions not visible');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 9: Admin Switch Button
    try {
      console.log('Test 9: Admin Switch Button');
      const switchBtn = await driver.findElement(By.css('.portal-switch--patient'));
      const isVisible = await switchBtn.isDisplayed();
      if (isVisible) {
        console.log('  ✅ Admin switch button visible');
        passed++;
      } else {
        console.log('  ❌ Switch button not visible');
        failed++;
      }
    } catch (e) {
      console.log('  ❌ Error:', e.message);
      failed++;
    }

    // Test 10: Switch to Admin
    try {
      console.log('Test 10: Switch to Admin');
      await driver.findElement(By.css('.portal-switch--patient')).click();
      await driver.sleep(500);
      
      const adminShell = await driver.findElement(By.css('.admin-shell'));
      const isVisible = await adminShell.isDisplayed();
      if (isVisible) {
        console.log('  ✅ Switched to admin dashboard');
        passed++;
      } else {
        console.log('  ❌ Switch to admin failed');
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
