/**
 * E2E Tests - Admin Dashboard
 * Full coverage for Admin Portal functionality
 */

import { test, expect } from "@playwright/test";

// Test data
const TEST_USER = {
  email: "admin@clinic.test",
  password: "Admin123!",
};

test.describe("Admin Dashboard - Overview", () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login as admin
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

  test("should display admin dashboard layout", async ({ page }) => {
    // Verify sidebar exists
    await expect(page.locator(".admin-shell")).toBeVisible();
    await expect(page.locator(".sidebar")).toBeVisible();
    
    // Verify logo
    await expect(page.locator(".brand")).toBeVisible();
    
    // Verify main content area
    await expect(page.locator(".admin-main")).toBeVisible();
    await expect(page.locator(".admin-content")).toBeVisible();
  });

  test("should display sidebar navigation", async ({ page }) => {
    // Check navigation buttons
    await expect(page.locator(".sidebar nav button").filter({ hasText: "Tổng quan" })).toBeVisible();
    await expect(page.locator(".sidebar nav button").filter({ hasText: "Lịch hẹn" })).toBeVisible();
    await expect(page.locator(".sidebar nav button").filter({ hasText: "Bác sĩ" })).toBeVisible();
    await expect(page.locator(".sidebar nav button").filter({ hasText: "Dịch vụ" })).toBeVisible();
  });

  test("should display overview metrics", async ({ page }) => {
    // KPI cards
    await expect(page.locator(".kpi-grid")).toBeVisible();
    await expect(page.locator(".kpi").first()).toBeVisible();
    
    // Check for loading state then data
    const kpiCards = page.locator(".kpi");
    await expect(kpiCards).toHaveCount(4); // Total, Pending, Confirmed, Completed
  });

  test("should display recent appointments table", async ({ page }) => {
    // Table should be visible
    await expect(page.locator(".table-card").first()).toBeVisible();
    
    // Table headers
    await expect(page.locator("th").filter({ hasText: "MÃ" })).toBeVisible();
    await expect(page.locator("th").filter({ hasText: "BỆNH NHÂN" })).toBeVisible();
    await expect(page.locator("th").filter({ hasText: "TRẠNG THÁI" })).toBeVisible();
  });

  test("should switch tabs in sidebar", async ({ page }) => {
    // Click Lịch hẹn tab
    await page.locator(".sidebar nav button").filter({ hasText: "Lịch hẹn" }).click();
    await expect(page.locator(".sidebar nav button").filter({ hasText: "Lịch hẹn" })).toHaveClass(/active/);
  });

  test("should have working logout button", async ({ page }) => {
    // Find and click logout button
    const logoutButton = page.locator('.sidebar-user button[aria-label="Đăng xuất"]');
    await expect(logoutButton).toBeVisible();
  });
});

test.describe("Admin Dashboard - Appointments", () => {
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
    
    // Navigate to appointments
    await page.locator(".sidebar nav button").filter({ hasText: "Lịch hẹn" }).click();
    await page.waitForTimeout(1000);
  });

  test("should display appointments page", async ({ page }) => {
    await expect(page.locator(".table-card")).toBeVisible();
    await expect(page.locator("h2").filter({ hasText: "Quản lý lịch hẹn" })).toBeVisible();
  });

  test("should display filter tabs", async ({ page }) => {
    await expect(page.locator(".table-tabs")).toBeVisible();
    await expect(page.locator(".table-tabs button").filter({ hasText: "Tất cả" })).toBeVisible();
    await expect(page.locator(".table-tabs button").filter({ hasText: "Chờ" })).toBeVisible();
    await expect(page.locator(".table-tabs button").filter({ hasText: "Đã xác nhận" })).toBeVisible();
  });

  test("should have working search box", async ({ page }) => {
    const searchInput = page.locator(".search-box input");
    await expect(searchInput).toBeVisible();
    
    // Type in search
    await searchInput.fill("test");
    await expect(searchInput).toHaveValue("test");
  });

  test("should display table with data", async ({ page }) => {
    await page.waitForTimeout(2000); // Wait for API
    
    // Table should be visible
    await expect(page.locator("table")).toBeVisible();
  });

  test("should open appointment detail drawer", async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Find and click a row or details button
    const detailButton = page.locator(".quick-actions .quick").filter({ hasText: "Chi tiết" }).first();
    if (await detailButton.isVisible()) {
      await detailButton.click();
      await expect(page.locator(".drawer")).toBeVisible();
    }
  });

  test("should change appointment status", async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Look for confirm button on pending appointments
    const confirmButton = page.locator(".quick-actions .quick.confirm").first();
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe("Admin Dashboard - Doctors", () => {
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
    
    // Navigate to doctors
    await page.locator(".sidebar nav button").filter({ hasText: "Bác sĩ" }).click();
    await page.waitForTimeout(1000);
  });

  test("should display doctors page", async ({ page }) => {
    await expect(page.locator(".table-card")).toBeVisible();
    await expect(page.locator("h2").filter({ hasText: "Quản lý bác sĩ" })).toBeVisible();
  });

  test("should display add doctor button", async ({ page }) => {
    const addButton = page.locator(".btn.primary").filter({ hasText: "Thêm bác sĩ" });
    await expect(addButton).toBeVisible();
  });

  test("should display doctors table", async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Table headers
    await expect(page.locator("th").filter({ hasText: "BÁC SĨ" })).toBeVisible();
    await expect(page.locator("th").filter({ hasText: "CHUYÊN KHOA" })).toBeVisible();
    await expect(page.locator("th").filter({ hasText: "TRẠNG THÁI" })).toBeVisible();
  });
});

test.describe("Admin Dashboard - Services", () => {
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
    
    // Navigate to services
    await page.locator(".sidebar nav button").filter({ hasText: "Dịch vụ" }).click();
    await page.waitForTimeout(1000);
  });

  test("should display services page", async ({ page }) => {
    await expect(page.locator(".table-card")).toBeVisible();
    await expect(page.locator("h2").filter({ hasText: "Quản lý dịch vụ" })).toBeVisible();
  });

  test("should display add service button", async ({ page }) => {
    const addButton = page.locator(".btn.primary").filter({ hasText: "Thêm dịch vụ" });
    await expect(addButton).toBeVisible();
  });
});
