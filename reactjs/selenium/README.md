# Medical Appointment System - Selenium E2E Tests

## Overview
Comprehensive Selenium WebDriver test suite for the Medical Appointment System.

## Prerequisites

1. **Node.js** installed
2. **Chrome or Firefox** browser installed
3. **Dev server** running on `http://localhost:5173`

## Installation

```bash
cd reactjs
npm install selenium-webdriver @types/selenium-webdriver
```

## Running Tests

### Run all tests
```bash
cd selenium
node runner.js
```

### Run individual test files
```bash
node admin.spec.js
node patient.spec.js
node auth.spec.js
node api.spec.js
```

## Test Files

| File | Description | Tests |
|------|-------------|-------|
| `config.js` | Configuration & helpers | - |
| `admin.spec.js` | Admin Dashboard | 10 |
| `patient.spec.js` | Patient Portal | 14 |
| `auth.spec.js` | Authentication | 13 |
| `api.spec.js` | API Integration | 12 |
| `runner.js` | Test runner | All |

## Test Coverage

### Admin Dashboard
- Admin shell layout
- Sidebar navigation
- KPI cards
- Table display
- Appointments management
- Doctors management
- Services management
- Portal switching
- Logout

### Patient Portal
- Patient portal layout
- Header with logo
- Navigation links
- Welcome section
- Search functionality
- Patient cards grid
- Care team
- Health summary
- Quick actions
- Admin switch

### Authentication
- Login form
- Email input validation
- Password input
- Remember me
- Forgot password flow
- Register flow
- Terms checkbox
- Session persistence

### API Integration
- Appointments page load
- Data columns verification
- Filter functionality
- Search functionality
- Doctors page
- Services page
- Overview statistics
- Recent appointments

## Configuration

Edit `config.js` to customize:
- `baseUrl`: Application URL
- `timeout`: Test timeout (ms)
- `implicitWait`: Implicit wait (ms)
- `headless`: Run headless mode

```javascript
const config = {
  baseUrl: 'http://localhost:5173',
  timeout: 30000,
  implicitWait: 5000,
  headless: true,  // Set to false to see browser
};
```

## Headless vs Headed Mode

**Headless (default)**: No browser window visible
```javascript
headless: true
```

**Headed**: Browser window visible
```javascript
headless: false
```

## Screenshots

Screenshots are saved to `screenshots/` directory on test failure.

## Tips

1. **Start dev server first**:
   ```bash
   npm run dev
   ```

2. **Run in headed mode** to debug:
   Edit `config.js` and set `headless: false`

3. **Run specific test file**:
   ```bash
   node selenium/admin.spec.js
   ```

4. **Check for ChromeDriver**:
   Selenium requires matching ChromeDriver version.
   Run `npx selenium-webdriver` to auto-download.

## Troubleshooting

### ChromeDriver not found
```bash
npx selenium-webdriver install chrome
```

### Connection refused
- Ensure dev server is running
- Check `baseUrl` in config.js

### Elements not found
- Check selectors in test files
- Verify element exists in DOM
- Increase timeout if needed
