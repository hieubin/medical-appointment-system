/**
 * Test Setup & Utilities
 * Common helper functions and setup for all tests
 */

import { test as base } from "@playwright/test";

/**
 * Custom test fixture with authentication helpers
 */
export const test = base.extend({
  // Admin user fixture
  adminUser: async ({}, use) => {
    const user = {
      id: "admin-001",
      email: "admin@clinic.test",
      fullName: "Admin Test",
      role: "ADMIN",
    };
    await use(user);
  },

  // Patient user fixture
  patientUser: async ({}, use) => {
    const user = {
      id: "patient-001",
      email: "patient@test.com",
      fullName: "Bệnh nhân Test",
      role: "PATIENT",
    };
    await use(user);
  },
});

/**
 * Helper to setup authenticated session
 */
export async function loginAsAdmin(page) {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("token", "test-token");
    localStorage.setItem("keepMeSignedIn", "true");
    localStorage.setItem("user", JSON.stringify({
      id: "admin-001",
      email: "admin@clinic.test",
      fullName: "Admin Test",
      role: "ADMIN",
    }));
  });
  await page.goto("/");
  await page.waitForTimeout(500);
}

/**
 * Helper to setup patient session
 */
export async function loginAsPatient(page) {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("token", "patient-token");
    localStorage.setItem("keepMeSignedIn", "true");
    localStorage.setItem("user", JSON.stringify({
      id: "patient-001",
      email: "patient@test.com",
      fullName: "Bệnh nhân Test",
      role: "PATIENT",
    }));
  });
  await page.goto("/");
  await page.waitForTimeout(500);
}

/**
 * Helper to logout
 */
export async function logout(page) {
  await page.evaluate(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("keepMeSignedIn");
  });
}

/**
 * Helper to wait for API response
 */
export async function waitForApiResponse(page, urlPattern, timeout = 5000) {
  return page.waitForResponse(
    response => response.url().includes(urlPattern),
    { timeout }
  );
}

/**
 * Helper to take screenshot on failure
 */
export async function takeScreenshot(page, name) {
  await page.screenshot({ 
    path: `screenshots/${name}-${Date.now()}.png`,
    fullPage: true 
  });
}
