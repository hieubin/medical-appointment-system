import pkg from 'selenium-webdriver';
const { Builder, By, until, Keys } = pkg;
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';

/**
 * Selenium WebDriver Configuration
 */
export const config = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  implicitWait: 5000,
  headless: true,
};

/**
 * Helper functions
 */
export const helpers = {
  /**
   * Setup driver
   */
  async createDriver(browser = 'chrome') {
    let driver;
    const options = browser === 'chrome' ? new chrome.Options() : new firefox.Options();
    
    if (config.headless) {
      options.addArguments('--headless');
    }
    options.addArguments('--no-sandbox', '--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.windowSize({ width: 1920, height: 1080 });

    driver = await new Builder()
      .forBrowser(browser)
      .setChromeOptions(options)
      .setFirefoxOptions(options)
      .build();

    await driver.manage().window().maximize();
    
    return driver;
  },

  /**
   * Setup admin user session
   */
  async loginAsAdmin(driver) {
    await driver.get(config.baseUrl);
    await driver.executeScript(() => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('keepMeSignedIn', 'true');
      localStorage.setItem('user', JSON.stringify({
        id: 'admin-001',
        email: 'admin@clinic.test',
        fullName: 'Admin Test',
        role: 'ADMIN',
      }));
    });
    await driver.get(config.baseUrl);
    await driver.sleep(500);
  },

  /**
   * Setup patient user session
   */
  async loginAsPatient(driver) {
    await driver.get(config.baseUrl);
    await driver.executeScript(() => {
      localStorage.setItem('token', 'patient-token');
      localStorage.setItem('keepMeSignedIn', 'true');
      localStorage.setItem('user', JSON.stringify({
        id: 'patient-001',
        email: 'patient@test.com',
        fullName: 'Bệnh nhân Test',
        role: 'PATIENT',
      }));
    });
    await driver.get(config.baseUrl);
    await driver.sleep(500);
  },

  /**
   * Clear session
   */
  async logout(driver) {
    await driver.executeScript(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('keepMeSignedIn');
    });
  },

  /**
   * Take screenshot
   */
  async takeScreenshot(driver, name) {
    const fs = await import('fs');
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync(`screenshots/${name}-${Date.now()}.png`, screenshot, 'base64');
    console.log(`📸 Screenshot saved: screenshots/${name}-${Date.now()}.png`);
  },
};
