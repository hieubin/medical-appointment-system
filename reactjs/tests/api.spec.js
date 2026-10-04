/**
 * E2E Tests - API Integration
 * Tests for backend API connectivity and data flow
 */

import { test, expect } from "@playwright/test";

const API_BASE_URL = "http://localhost:3000/api";

test.describe("API - Health Check", () => {
  test("should have backend server running", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`);
    // Server should respond (200 or other status, just checking connectivity)
    expect(response.status()).toBeGreaterThanOrEqual(200);
  });
});

test.describe("API - Admin Appointments", () => {
  test("should fetch appointments list", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/admin/appointments?page=1&limit=10`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty("data");
  });

  test("should fetch appointment statistics", async ({ request }) => {
    const today = new Date().toISOString().split("T")[0];
    const response = await request.get(`${API_BASE_URL}/admin/statistics/appointments?from=${today}&to=${today}`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty("data");
  });

  test("should filter appointments by status", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/admin/appointments?status=PENDING&page=1&limit=10`);
    expect(response.ok()).toBeTruthy();
  });
});

test.describe("API - Admin Doctors", () => {
  test("should fetch doctors list", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/admin/doctors`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data.data)).toBeTruthy();
  });
});

test.describe("API - Admin Services", () => {
  test("should fetch services list", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/admin/services`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data.data)).toBeTruthy();
  });
});

test.describe("API - Public Endpoints", () => {
  test("should fetch specialties", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/specialties`);
    expect(response.ok()).toBeTruthy();
  });

  test("should fetch services for booking", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/services`);
    expect(response.ok()).toBeTruthy();
  });

  test("should fetch doctors for booking", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/doctors`);
    expect(response.ok()).toBeTruthy();
  });
});

test.describe("UI Integration with API", () => {
  test.beforeEach(async ({ page }) => {
    // Setup admin user
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

  test("should load appointments from API", async ({ page }) => {
    // Navigate to appointments
    await page.locator(".sidebar nav button").filter({ hasText: "Lịch hẹn" }).click();
    await page.waitForTimeout(2000); // Wait for API call
    
    // Table should have data
    const tableRows = page.locator("tbody tr");
    const count = await tableRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should load doctors from API", async ({ page }) => {
    // Navigate to doctors
    await page.locator(".sidebar nav button").filter({ hasText: "Bác sĩ" }).click();
    await page.waitForTimeout(2000);
    
    // Should show count
    const countText = await page.locator(".table-title span").textContent();
    expect(countText).toContain("bác sĩ");
  });

  test("should load services from API", async ({ page }) => {
    // Navigate to services
    await page.locator(".sidebar nav button").filter({ hasText: "Dịch vụ" }).click();
    await page.waitForTimeout(2000);
    
    // Should show count
    const countText = await page.locator(".table-title span").textContent();
    expect(countText).toContain("dịch vụ");
  });

  test("should display statistics on overview", async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // KPI cards should have values
    const kpiValues = page.locator(".kpi strong");
    const count = await kpiValues.count();
    expect(count).toBe(4);
  });
});
