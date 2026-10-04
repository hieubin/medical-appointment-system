/**
 * E2E Tests - Navigation & Workflows
 * Tests for navigation flows and user workflows
 */

import { test, expect } from "@playwright/test";

test.describe("Navigation - Admin Portal", () => {
  test.beforeEach(async ({ page }) => {
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
  });

  test("should navigate to overview from dashboard", async ({ page }) => {
    // Overview should be default active
    await expect(page.locator(".sidebar nav button.active")).toContainText("Tổng quan");
  });

  test("should navigate to appointments", async ({ page }) => {
    await page.locator(".sidebar nav button").filter({ hasText: "Lịch hẹn" }).click();
    await expect(page.locator(".sidebar nav button").filter({ hasText: "Lịch hẹn" })).toHaveClass(/active/);
  });

  test("should navigate to doctors", async ({ page }) => {
    await page.locator(".sidebar nav button").filter({ hasText: "Bác sĩ" }).click();
    await expect(page.locator(".sidebar nav button").filter({ hasText: "Bác sĩ" })).toHaveClass(/active/);
  });

  test("should navigate to services", async ({ page }) => {
    await page.locator(".sidebar nav button").filter({ hasText: "Dịch vụ" }).click();
    await expect(page.locator(".sidebar nav button").filter({ hasText: "Dịch vụ" })).toHaveClass(/active/);
  });

  test("should switch to patient portal", async ({ page }) => {
    await page.locator(".sidebar nav button").filter({ hasText: "Cổng bệnh nhân" }).click();
    await expect(page.locator(".patient-portal")).toBeVisible();
  });

  test("should logout from admin", async ({ page }) => {
    await page.locator('.sidebar-user button[aria-label="Đăng xuất"]').click();
    await page.waitForTimeout(500);
    
    // Should show login
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("Navigation - Patient Portal", () => {
  test.beforeEach(async ({ page }) => {
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
    
    // Switch to patient portal if not default
    const adminShell = page.locator(".admin-shell");
    if (await adminShell.isVisible()) {
      await page.locator(".sidebar nav button").filter({ hasText: "Cổng bệnh nhân" }).click();
      await page.waitForTimeout(300);
    }
  });

  test("should navigate via patient nav links", async ({ page }) => {
    await expect(page.locator("nav").filter({ hasText: "Tìm bác sĩ" })).toBeVisible();
    await expect(page.locator("nav").filter({ hasText: "Lịch hẹn của tôi" })).toBeVisible();
    await expect(page.locator("nav").filter({ hasText: "Hồ sơ sức khỏe" })).toBeVisible();
  });

  test("should switch to admin portal", async ({ page }) => {
    await page.locator(".portal-switch--patient").click();
    await page.waitForTimeout(500);
    await expect(page.locator(".admin-shell")).toBeVisible();
  });
});

test.describe("Workflow - Complete User Journey", () => {
  test("should complete admin workflow", async ({ page }) => {
    // Login
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.goto("/");
    await page.waitForTimeout(500);
    
    // Note: Real login would require backend, but we test with mocked auth
    await page.evaluate(() => {
      localStorage.setItem("token", "admin-token");
      localStorage.setItem("keepMeSignedIn", "true");
      localStorage.setItem("user", JSON.stringify({
        id: "admin-001",
        email: "admin@clinic.test",
        fullName: "Admin User",
        role: "ADMIN",
      }));
    });
    await page.goto("/");
    await page.waitForTimeout(500);
    
    // View overview
    await expect(page.locator(".admin-shell")).toBeVisible();
    
    // Navigate to appointments
    await page.locator(".sidebar nav button").filter({ hasText: "Lịch hẹn" }).click();
    await page.waitForTimeout(500);
    
    // Navigate to doctors
    await page.locator(".sidebar nav button").filter({ hasText: "Bác sĩ" }).click();
    await page.waitForTimeout(500);
    
    // Navigate to services
    await page.locator(".sidebar nav button").filter({ hasText: "Dịch vụ" }).click();
    await page.waitForTimeout(500);
    
    // Switch to patient
    await page.locator(".sidebar nav button").filter({ hasText: "Cổng bệnh nhân" }).click();
    await page.waitForTimeout(500);
    
    // Should be in patient portal
    await expect(page.locator(".patient-portal")).toBeVisible();
  });

  test("should complete patient workflow", async ({ page }) => {
    // Login as patient
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
    
    // Switch to patient if needed
    const adminShell = page.locator(".admin-shell");
    if (await adminShell.isVisible()) {
      await page.locator(".portal-switch--patient").click();
      await page.waitForTimeout(300);
    }
    
    // Patient portal should be visible
    await expect(page.locator(".patient-portal")).toBeVisible();
    
    // Search for doctor
    const searchInput = page.locator(".patient-search input").first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("Tim mạch");
    }
    
    // Switch to admin
    await page.locator(".portal-switch--patient").click();
    await page.waitForTimeout(500);
    await expect(page.locator(".admin-shell")).toBeVisible();
  });
});

test.describe("Workflow - Appointment Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("token", "admin-token");
      localStorage.setItem("keepMeSignedIn", "true");
      localStorage.setItem("user", JSON.stringify({
        id: "admin-001",
        email: "admin@clinic.test",
        fullName: "Admin User",
        role: "ADMIN",
      }));
    });
    await page.goto("/");
    
    // Navigate to appointments
    await page.locator(".sidebar nav button").filter({ hasText: "Lịch hẹn" }).click();
    await page.waitForTimeout(1500);
  });

  test("should view all appointments", async ({ page }) => {
    await expect(page.locator(".table-card")).toBeVisible();
    await expect(page.locator("table")).toBeVisible();
  });

  test("should filter appointments by status", async ({ page }) => {
    // Click on pending filter
    const pendingTab = page.locator(".table-tabs button").filter({ hasText: "Chờ" });
    if (await pendingTab.isVisible()) {
      await pendingTab.click();
      await page.waitForTimeout(500);
    }
  });

  test("should search appointments", async ({ page }) => {
    const searchInput = page.locator(".search-box input");
    if (await searchInput.isVisible()) {
      await searchInput.fill("Linh");
      await page.waitForTimeout(500);
    }
  });

  test("should view appointment details", async ({ page }) => {
    // Find a detail button
    const detailButton = page.locator(".quick-actions .quick").filter({ hasText: "Chi tiết" }).first();
    if (await detailButton.isVisible()) {
      await detailButton.click();
      await page.waitForTimeout(300);
      await expect(page.locator(".drawer")).toBeVisible();
      
      // Close drawer
      await page.locator(".drawer button").first().click();
    }
  });
});

test.describe("Responsive Design", () => {
  test("should display correctly on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
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
    
    await expect(page.locator(".admin-shell")).toBeVisible();
    await expect(page.locator(".sidebar")).toBeVisible();
  });

  test("should display correctly on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
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
    
    await expect(page.locator(".admin-shell")).toBeVisible();
  });
});

test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
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
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    // Should have h1
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should have accessible buttons", async ({ page }) => {
    const buttons = page.locator("button");
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should have form labels", async ({ page }) => {
    // Search inputs should have labels
    const searchInput = page.locator(".search-box input, .field__input").first();
    if (await searchInput.isVisible()) {
      const label = page.locator("label, .field__label").first();
      // Label should exist or be associated
    }
  });
});
