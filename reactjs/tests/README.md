# Medical Appointment System - E2E Tests

## Overview
Comprehensive Playwright E2E test suite for the Medical Appointment System frontend.

## Test Coverage

### 1. Admin Dashboard (`tests/admin.spec.js`)
- Overview page with KPI metrics
- Appointments management
- Doctors management
- Services management
- Navigation between tabs
- Logout functionality

### 2. Patient Portal (`tests/patient.spec.js`)
- Patient portal layout
- Navigation
- Doctor search
- Care team display
- Admin portal switch

### 3. Authentication (`tests/auth.spec.js`)
- Login form validation
- Register form validation
- Forgot password flow
- Session management
- Remember me functionality

### 4. API Integration (`tests/api.spec.js`)
- Backend health check
- Appointments API
- Doctors API
- Services API
- Public endpoints
- UI-API integration

### 5. UI Components (`tests/components.spec.js`)
- Button variants
- Status badges
- Icons
- Logo
- Tables
- Search boxes
- Tabs

### 6. Workflows (`tests/workflows.spec.js`)
- Complete user journeys
- Navigation flows
- Appointment management workflow
- Responsive design
- Accessibility

## Running Tests

### Run all tests
```bash
npm test
```

### Run specific test file
```bash
npx playwright test tests/admin.spec.js
```

### Run with UI
```bash
npx playwright test --ui
```

### Run in headed mode (see browser)
```bash
npx playwright test --headed
```

### Run specific test by name
```bash
npx playwright test -g "should display"
```

### Run with debug
```bash
npx playwright test --debug
```

## Prerequisites

1. Start the development server:
```bash
npm run dev
```

2. Start the backend API (in another terminal):
```bash
cd ../expressjs
npm run dev
```

## Configuration

Edit `playwright.config.js` to customize:
- Base URL
- Browser selection
- Test timeout
- Retries
- Reporters

## Test Reports

HTML reports are generated in `playwright-report/` after test run.

```bash
# Open report
npx playwright show-report
```

## Writing New Tests

1. Import test utilities:
```javascript
import { test, expect } from "@playwright/test";
```

2. Use fixtures for authentication:
```javascript
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("token", "test-token");
    // ...
  });
  await page.goto("/");
});
```

3. Add assertions:
```javascript
await expect(page.locator(".admin-shell")).toBeVisible();
```

## CI/CD Integration

For CI environments, set `CI=true`:
```bash
CI=true npx playwright test
```

## Troubleshooting

### Tests fail due to API not responding
- Ensure backend server is running on port 3000
- Check API endpoints are accessible

### Tests timeout
- Increase timeout in playwright.config.js
- Check network connectivity

### Elements not found
- Check if localStorage setup is correct
- Verify element selectors match actual HTML
