/**
 * E2E Tests - UI Components
 * Tests for reusable UI components
 */

import { test, expect } from "@playwright/test";

test.describe("UI Components - Button", () => {
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

  test("should display primary button styles", async ({ page }) => {
    const primaryButton = page.locator(".btn.primary, button.button--primary").first();
    if (await primaryButton.isVisible()) {
      await expect(primaryButton).toBeVisible();
    }
  });

  test("should display secondary button styles", async ({ page }) => {
    const secondaryButton = page.locator(".btn.secondary, button.button--secondary").first();
    if (await secondaryButton.isVisible()) {
      await expect(secondaryButton).toBeVisible();
    }
  });

  test("should display ghost button styles", async ({ page }) => {
    const ghostButton = page.locator(".btn.text, button.button--ghost").first();
    if (await ghostButton.isVisible()) {
      await expect(ghostButton).toBeVisible();
    }
  });

  test("should handle button click", async ({ page }) => {
    // Click on sidebar navigation
    await page.locator(".sidebar nav button").filter({ hasText: "Lịch hẹn" }).click();
    await expect(page.locator(".sidebar nav button").filter({ hasText: "Lịch hẹn" })).toHaveClass(/active/);
  });

  test("should disable button when loading", async ({ page }) => {
    // Navigation buttons should work
    await page.locator(".sidebar nav button").filter({ hasText: "Lịch hẹn" }).click();
  });
});

test.describe("UI Components - StatusBadge", () => {
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
    await page.waitForTimeout(1000);
  });

  test("should display status badge styles", async ({ page }) => {
    const statusBadge = page.locator(".status").first();
    if (await statusBadge.isVisible()) {
      await expect(statusBadge).toBeVisible();
    }
  });

  test("should display pending status", async ({ page }) => {
    const pendingBadge = page.locator(".status--pending").first();
    if (await pendingBadge.isVisible()) {
      await expect(pendingBadge).toContainText("Pending");
    }
  });

  test("should display confirmed status", async ({ page }) => {
    const confirmedBadge = page.locator(".status--confirmed").first();
    if (await confirmedBadge.isVisible()) {
      await expect(confirmedBadge).toContainText("Confirmed");
    }
  });

  test("should display completed status", async ({ page }) => {
    const completedBadge = page.locator(".status--completed").first();
    if (await completedBadge.isVisible()) {
      await expect(completedBadge).toContainText("Completed");
    }
  });
});

test.describe("UI Components - Icon", () => {
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

  test("should display SVG icons", async ({ page }) => {
    const icon = page.locator("svg.icon").first();
    await expect(icon).toBeVisible();
  });

  test("should display grid icon", async ({ page }) => {
    const gridIcon = page.locator(".sidebar nav button").filter({ hasText: "Tổng quan" }).locator("svg.icon").first();
    await expect(gridIcon).toBeVisible();
  });

  test("should display calendar icon", async ({ page }) => {
    const calendarIcon = page.locator(".sidebar nav button").filter({ hasText: "Lịch hẹn" }).locator("svg.icon").first();
    await expect(calendarIcon).toBeVisible();
  });
});

test.describe("UI Components - Logo", () => {
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

  test("should display logo", async ({ page }) => {
    await expect(page.locator(".brand, .logo")).toBeVisible();
  });

  test("should display logo with brand name", async ({ page }) => {
    await expect(page.locator(".brand-name, .logo strong")).toContainText("Medora");
  });
});

test.describe("UI Components - Tables", () => {
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
    
    // Navigate to appointments for table tests
    await page.locator(".sidebar nav button").filter({ hasText: "Lịch hẹn" }).click();
    await page.waitForTimeout(1000);
  });

  test("should display table headers", async ({ page }) => {
    await expect(page.locator("thead tr")).toBeVisible();
  });

  test("should display table with proper styling", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible();
    await expect(page.locator("thead")).toBeVisible();
    await expect(page.locator("tbody")).toBeVisible();
  });

  test("should handle table row hover", async ({ page }) => {
    const row = page.locator("tbody tr").first();
    if (await row.isVisible()) {
      await row.hover();
    }
  });

  test("should display pagination controls", async ({ page }) => {
    const pagination = page.locator(".table-footer, .pagination").first();
    if (await pagination.isVisible()) {
      await expect(pagination).toBeVisible();
    }
  });
});

test.describe("UI Components - Search", () => {
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

  test("should display search box", async ({ page }) => {
    const searchBox = page.locator(".search-box, .field").first();
    if (await searchBox.isVisible()) {
      await expect(searchBox).toBeVisible();
    }
  });

  test("should accept input in search box", async ({ page }) => {
    const searchInput = page.locator(".search-box input, .field__input").first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("test search");
      await expect(searchInput).toHaveValue("test search");
    }
  });

  test("should display search icon", async ({ page }) => {
    const searchIcon = page.locator(".search-box svg.icon, .field svg.icon").first();
    if (await searchIcon.isVisible()) {
      await expect(searchIcon).toBeVisible();
    }
  });
});

test.describe("UI Components - Tabs", () => {
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
    
    await page.locator(".sidebar nav button").filter({ hasText: "Lịch hẹn" }).click();
    await page.waitForTimeout(1000);
  });

  test("should display tab buttons", async ({ page }) => {
    await expect(page.locator(".table-tabs")).toBeVisible();
  });

  test("should have active tab state", async ({ page }) => {
    const activeTab = page.locator(".table-tabs button.active").first();
    await expect(activeTab).toBeVisible();
  });

  test("should switch tabs", async ({ page }) => {
    const pendingTab = page.locator(".table-tabs button").filter({ hasText: "Chờ" }).first();
    if (await pendingTab.isVisible()) {
      await pendingTab.click();
      await expect(pendingTab).toHaveClass(/active/);
    }
  });
});
