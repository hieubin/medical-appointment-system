/**
 * E2E Tests - Patient Portal
 * Full coverage for Patient Portal functionality
 */

import { test, expect } from "@playwright/test";

test.describe("Patient Portal - Main Interface", () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login as patient
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("token", "patient-token");
      localStorage.setItem("keepMeSignedIn", "true");
      localStorage.setItem("user", JSON.stringify({
        id: "patient-001",
        email: "patient@test.com",
        fullName: "Lê Thị Hương",
        role: "PATIENT",
      }));
    });
    await page.goto("/");
    // Switch to patient portal
    await page.evaluate(() => {
      // Force patient screen
      localStorage.setItem("screen", "patient");
    });
    await page.goto("/");
    await page.waitForTimeout(500);
  });

  test("should display patient portal layout", async ({ page }) => {
    // Verify patient portal container
    await expect(page.locator(".patient-portal")).toBeVisible();
    
    // Header should be visible
    await expect(page.locator(".patient-header")).toBeVisible();
  });

  test("should display logo", async ({ page }) => {
    await expect(page.locator(".brand")).toBeVisible();
    await expect(page.locator(".brand-name")).toContainText("Medora");
  });

  test("should display patient navigation", async ({ page }) => {
    await expect(page.locator("nav a").filter({ hasText: "Tìm bác sĩ" })).toBeVisible();
    await expect(page.locator("nav a").filter({ hasText: "Lịch hẹn của tôi" })).toBeVisible();
    await expect(page.locator("nav a").filter({ hasText: "Hồ sơ sức khỏe" })).toBeVisible();
  });

  test("should display patient welcome section", async ({ page }) => {
    await expect(page.locator(".patient-welcome")).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should display patient search section", async ({ page }) => {
    await expect(page.locator(".patient-search")).toBeVisible();
    await expect(page.locator("h2").filter({ hasText: "Tìm bác sĩ" })).toBeVisible();
  });

  test("should have working search fields", async ({ page }) => {
    // Find search inputs
    const specialtyInput = page.locator(".patient-search input").first();
    await expect(specialtyInput).toBeVisible();
    
    // Type in search
    await specialtyInput.fill("Tim mạch");
    await expect(specialtyInput).toHaveValue("Tim mạch");
  });

  test("should display patient grid cards", async ({ page }) => {
    await expect(page.locator(".patient-grid")).toBeVisible();
    
    // Upcoming appointments card
    await expect(page.locator(".patient-card.upcoming")).toBeVisible();
    
    // Care team card
    await expect(page.locator(".patient-card.care-team")).toBeVisible();
    
    // Health summary card
    await expect(page.locator(".patient-card.health-summary")).toBeVisible();
  });

  test("should display quick actions", async ({ page }) => {
    await expect(page.locator(".portal-quick-actions")).toBeVisible();
    await expect(page.locator(".portal-quick-actions button").filter({ hasText: "Đặt lịch khám" })).toBeVisible();
    await expect(page.locator(".portal-quick-actions button").filter({ hasText: "Tìm bác sĩ" })).toBeVisible();
  });

  test("should display admin switch button", async ({ page }) => {
    const switchButton = page.locator(".portal-switch--patient");
    await expect(switchButton).toBeVisible();
    await expect(switchButton).toContainText("Staff admin");
  });

  test("should switch to admin dashboard", async ({ page }) => {
    // Click admin switch button
    await page.locator(".portal-switch--patient").click();
    await page.waitForTimeout(500);
    
    // Should show admin dashboard
    await expect(page.locator(".admin-shell")).toBeVisible();
  });

  test("should display patient avatar", async ({ page }) => {
    await expect(page.locator(".patient-avatar")).toBeVisible();
  });
});

test.describe("Patient Portal - Doctor Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("token", "patient-token");
      localStorage.setItem("keepMeSignedIn", "true");
      localStorage.setItem("user", JSON.stringify({
        id: "patient-001",
        email: "patient@test.com",
        fullName: "Lê Thị Hương",
        role: "PATIENT",
      }));
    });
    await page.goto("/");
    await page.waitForTimeout(500);
  });

  test("should display search form", async ({ page }) => {
    // Specialty search
    await expect(page.locator("input[placeholder*='Tim mạch']")).toBeVisible();
    
    // Location search
    await expect(page.locator("input[placeholder*='Phòng khám']")).toBeVisible();
    
    // Date search
    await expect(page.locator("input[placeholder*='04/10/2026']")).toBeVisible();
  });

  test("should have working search button", async ({ page }) => {
    const searchButton = page.locator(".patient-search .btn").filter({ hasText: "Tìm kiếm" });
    await expect(searchButton).toBeVisible();
  });
});

test.describe("Patient Portal - Care Team", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("token", "patient-token");
      localStorage.setItem("keepMeSignedIn", "true");
      localStorage.setItem("user", JSON.stringify({
        id: "patient-001",
        email: "patient@test.com",
        fullName: "Lê Thị Hương",
        role: "PATIENT",
      }));
    });
    await page.goto("/");
    await page.waitForTimeout(500);
  });

  test("should display care team section", async ({ page }) => {
    await expect(page.locator(".care-team")).toBeVisible();
    await expect(page.locator(".care-team h2").filter({ hasText: "Chuyên khoa" })).toBeVisible();
  });

  test("should display doctors in care team", async ({ page }) => {
    await expect(page.locator(".care-row").first()).toBeVisible();
  });
});
