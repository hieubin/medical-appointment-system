import pkg from 'selenium-webdriver';
const { By, until } = pkg;
import { config, helpers } from './config.js';
import http from 'http';

const API_BASE = 'http://localhost:4000/api';

function apiLogin(email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });
    const req = http.request({
      hostname: 'localhost', port: 4000, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let body = ''; res.on('data', chunk => body += chunk);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid JSON')); } });
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

async function main() {
  let driver;
  console.log('🔍 Manual E2E Test - Opening Real Browser...\n');
  
  try {
    driver = await helpers.createDriver('chrome');
    await driver.manage().window().setRect({ width: 1440, height: 900 });
    
    // === TEST 1: Login thật ===
    console.log('📱 Test 1: Login thật với API');
    const result = await apiLogin('patient@clinic.test', 'Patient123!');
    if (result.success) {
      await driver.get(config.baseUrl);
      await helpers.logout(driver);
      await driver.executeScript((token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }, result.data.accessToken, result.data.user);
      await driver.get(config.baseUrl);
      await driver.sleep(1500);
      await helpers.takeScreenshot(driver, '01-patient-portal');
      console.log('  ✅ Đã chụp: 01-patient-portal.png');
    }
    
    // === TEST 2: Click "Đặt lịch khám" ===
    console.log('\n📱 Test 2: Click nút "Đặt lịch khám"');
    const bookingBtn = await driver.findElements(By.xpath("//button[contains(., 'Đặt lịch khám')]"));
    if (bookingBtn.length > 0) {
      await bookingBtn[0].click();
      await driver.sleep(1000);
      await helpers.takeScreenshot(driver, '02-booking-modal');
      console.log(`  ✅ Tìm thấy ${bookingBtn.length} nút, đã click và chụp: 02-booking-modal.png`);
    }
    
    // === TEST 3: Check Staff Admin Switch ===
    console.log('\n📱 Test 3: Staff Admin Switch Button');
    const staffBtn = await driver.findElements(By.xpath("//button[contains(., 'Staff admin')]"));
    if (staffBtn.length > 0) {
      await staffBtn[0].click();
      await driver.sleep(1000);
      await helpers.takeScreenshot(driver, '03-admin-dashboard');
      console.log('  ✅ Click Staff Admin, đã chụp: 03-admin-dashboard.png');
    }
    
    // === TEST 4: Admin Login ===
    console.log('\n📱 Test 4: Admin Login');
    await helpers.logout(driver);
    const adminResult = await apiLogin('admin@clinic.test', 'Admin123!');
    if (adminResult.success) {
      await driver.executeScript((token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }, adminResult.data.accessToken, adminResult.data.user);
      await driver.get(config.baseUrl);
      await driver.sleep(1500);
      await helpers.takeScreenshot(driver, '04-admin-shell');
      console.log('  ✅ Admin Dashboard, đã chụp: 04-admin-shell.png');
    }
    
    // === TEST 5: Navigate Admin Tabs ===
    console.log('\n📱 Test 5: Admin Navigation');
    const tabs = ['Lịch hẹn', 'Bác sĩ', 'Dịch vụ'];
    for (const tab of tabs) {
      await driver.executeScript((text) => {
        const btns = document.querySelectorAll('.sidebar nav button');
        for (const btn of btns) {
          if (btn.textContent.includes(text)) { btn.click(); break; }
        }
      }, tab);
      await driver.sleep(800);
      await helpers.takeScreenshot(driver, `05-admin-${tab.replace(/\s/g, '-')}`);
      console.log(`  ✅ ${tab}, đã chụp: 05-admin-${tab.replace(/\s/g, '-')}.png`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Hoàn tất! Screenshots đã lưu trong thư mục screenshots/');
    console.log('='.repeat(50));
    
  } catch (e) {
    console.error('❌ Lỗi:', e.message);
    if (driver) await helpers.takeScreenshot(driver, 'error');
  } finally {
    if (driver) {
      console.log('\n⏸️ Browser vẫn mở. Đóng browser? (y/n)');
      // Keep browser open for user to inspect
    }
  }
}

main().catch(console.error);
