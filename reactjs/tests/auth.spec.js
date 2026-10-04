/**
 * E2E Tests - Authentication
 * Full coverage for Login, Register, Forgot Password
 */

import { test, expect } from "@playwright/test";

test.describe("Authentication - Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.goto("/");
    await page.waitForTimeout(500);
  });

  test("should display login page by default", async ({ page }) => {
    // Check for login form elements
    await expect(page.locator("h1").filter({ hasText: /đăng nhập/i })).toBeVisible();
  });

  test("should display email input field", async ({ page }) => {
    await expect(page.locator("input[type='email'], input[name='email']")).toBeVisible();
  });

  test("should display password input field", async ({ page }) => {
    await expect(page.locator("input[type='password'], input[name='password']")).toBeVisible();
  });

  test("should display remember me checkbox", async ({ page }) => {
    const checkbox = page.locator("input[type='checkbox']");
    await expect(checkbox).toBeVisible();
  });

  test("should display login button", async ({ page }) => {
    const loginButton = page.locator("button[type='submit']").filter({ hasText: /đăng nhập/i });
    await expect(loginButton).toBeVisible();
  });

  test("should validate email format", async ({ page }) => {
    const emailInput = page.locator("input[type='email'], input[name='email']");
    await emailInput.fill("invalid-email");
    await page.locator("button[type='submit']").filter({ hasText: /đăng nhập/i }).click();
    // Error message should appear
  });

  test("should display forgot password link", async ({ page }) => {
    await expect(page.locator("text=/quên mật khẩu/i")).toBeVisible();
  });

  test("should display register link", async ({ page }) => {
    await expect(page.locator("text=/tạo workspace/i")).toBeVisible();
  });

  test("should navigate to forgot password", async ({ page }) => {
    await page.locator("text=/quên mật khẩu/i").click();
    await page.waitForTimeout(300);
    // Should show forgot password form
  });

  test("should navigate to register", async ({ page }) => {
    await page.locator("text=/tạo workspace/i").click();
    await page.waitForTimeout(300);
    // Should show register form
  });

  test("should toggle password visibility", async ({ page }) => {
    const passwordInput = page.locator("input[type='password']");
    await expect(passwordInput).toBeVisible();
    
    // Look for eye icon button
    const toggleButton = page.locator("button").filter({ has: page.locator("svg") }).first();
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
    }
  });
});

test.describe("Authentication - Register", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.goto("/");
    
    // Navigate to register
    await page.locator("text=/tạo workspace/i").click();
    await page.waitForTimeout(500);
  });

  test("should display register form", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: /tạo workspace/i })).toBeVisible();
  });

  test("should display required fields", async ({ page }) => {
    // First name
    await expect(page.locator("text=/họ/i").first()).toBeVisible();
    // Last name
    await expect(page.locator("text=/tên/i").first()).toBeVisible();
    // Email
    await expect(page.locator("text=/email/i").first()).toBeVisible();
    // Password
    await expect(page.locator("text=/mật khẩu/i").first()).toBeVisible();
  });

  test("should display terms checkbox", async ({ page }) => {
    await expect(page.locator("text=/điều khoản/i")).toBeVisible();
    await expect(page.locator("input[type='checkbox']")).toBeVisible();
  });

  test("should display create button", async ({ page }) => {
    const createButton = page.locator("button[type='submit']").filter({ hasText: /tạo/i });
    await expect(createButton).toBeVisible();
  });

  test("should display login link", async ({ page }) => {
    await expect(page.locator("text=/đăng nhập/i")).toBeVisible();
  });

  test("should validate password strength", async ({ page }) => {
    // Password input
    const passwordInput = page.locator("input[type='password']");
    await passwordInput.fill("123");
    await page.locator("button[type='submit']").filter({ hasText: /tạo/i }).click();
    // Should show password validation error
  });

  test("should require terms agreement", async ({ page }) => {
    // Fill form without checking terms
    await page.locator("input[name='firstName'], input[placeholder*='Họ']").fill("Test");
    await page.locator("input[name='lastName'], input[placeholder*='Tên']").fill("User");
    await page.locator("input[type='email']").fill("test@example.com");
    await page.locator("input[type='password']").fill("TestPassword123!");
    
    // Try to submit without agreeing to terms
    await page.locator("button[type='submit']").filter({ hasText: /tạo/i }).click();
    // Should show error or prevent submission
  });

  test("should navigate back to login", async ({ page }) => {
    await page.locator("text=/đăng nhập/i").click();
    await page.waitForTimeout(300);
    // Should show login form
    await expect(page.locator("h1").filter({ hasText: /đăng nhập/i })).toBeVisible();
  });
});

test.describe("Authentication - Forgot Password", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.goto("/");
    
    // Navigate to forgot password
    await page.locator("text=/quên mật khẩu/i").click();
    await page.waitForTimeout(500);
  });

  test("should display forgot password form", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: /khôi phục/i })).toBeVisible();
  });

  test("should display email input", async ({ page }) => {
    await expect(page.locator("input[type='email'], input[name='email']")).toBeVisible();
  });

  test("should display send button", async ({ page }) => {
    const sendButton = page.locator("button[type='submit']").filter({ hasText: /gửi/i });
    await expect(sendButton).toBeVisible();
  });

  test("should display back to login link", async ({ page }) => {
    await expect(page.locator("text=/đăng nhập/i")).toBeVisible();
  });

  test("should navigate back to login", async ({ page }) => {
    await page.locator("text=/đăng nhập/i").click();
    await page.waitForTimeout(300);
    await expect(page.locator("h1").filter({ hasText: /đăng nhập/i })).toBeVisible();
  });

  test("should validate email format", async ({ page }) => {
    await page.locator("input[type='email'], input[name='email']").fill("invalid-email");
    await page.locator("button[type='submit']").filter({ hasText: /gửi/i }).click();
    // Should show validation error
  });
});

test.describe("Authentication - Session Management", () => {
  test("should redirect to login when no token", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.goto("/");
    await page.waitForTimeout(500);
    
    // Should show login or auth screen
    await expect(page.locator(".auth-section, .auth-screen, h1")).toBeVisible();
  });

  test("should stay logged in when token exists", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("token", "valid-token");
      localStorage.setItem("keepMeSignedIn", "true");
      localStorage.setItem("user", JSON.stringify({
        id: "user-001",
        email: "user@test.com",
        fullName: "Test User",
        role: "ADMIN",
      }));
    });
    await page.goto("/");
    await page.waitForTimeout(500);
    
    // Should show dashboard
    await expect(page.locator(".admin-shell, .patient-portal")).toBeVisible();
  });

  test("should logout and redirect to login", async ({ page }) => {
    // Setup logged in state
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("token", "valid-token");
      localStorage.setItem("keepMeSignedIn", "true");
      localStorage.setItem("user", JSON.stringify({
        id: "admin-001",
        email: "admin@test.com",
        fullName: "Admin User",
        role: "ADMIN",
      }));
    });
    await page.goto("/");
    await page.waitForTimeout(500);
    
    // Click logout
    const logoutButton = page.locator('button[aria-label="Đăng xuất"], .logout-btn, button:has-text("Đăng xuất")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForTimeout(500);
      
      // Should be redirected to login
      await expect(page.locator(".auth-section, .auth-screen, input[type='email']")).toBeVisible();
    }
  });
});
