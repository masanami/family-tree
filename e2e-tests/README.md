# E2E Tests for Family Tree Application

This directory contains end-to-end tests for the Family Tree application using Playwright.

## Setup

1. Install dependencies:
   ```bash
   npm install
   npx playwright install
   ```

2. Ensure the application is running:
   - Backend: `http://localhost:5001` (configurable)
   - Frontend: `http://localhost:3000` (when available)

## Running Tests

```bash
# Run all tests
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run tests with UI mode
npm run test:ui

# Generate code by recording actions
npm run test:codegen
```

## Current Implementation Status

### ✅ Completed Features
- **Test Infrastructure**: Playwright setup with TypeScript
- **API Client**: Comprehensive HTTP client for backend communication
- **Test Scenarios**: Detailed scenario documentation in `.ai/test-scenarios/`
- **Backend Integration**: Connection to Express backend server
- **Test Organization**: Page objects, test data generators, fixtures

### 🚧 Current Limitations
- **Backend API**: Currently only provides basic HTTP endpoints (health check)
- **API Endpoints**: Family tree and person management endpoints not implemented yet
- **Frontend**: No frontend implementation available for UI testing

## Test Structure

```
e2e-tests/
├── tests/                    # Test files
│   ├── backend-ready.spec.ts     # ✅ Backend connectivity tests
│   ├── api-integration.spec.ts   # 🚧 API tests (waiting for backend implementation)
│   ├── family-tree-creation.spec.ts  # 🚧 UI tests (waiting for frontend)
│   └── person-management.spec.ts     # 🚧 UI tests (waiting for frontend)
├── helpers/                  # Helper functions
│   ├── page-objects.ts      # Page object models for UI testing
│   └── test-data.ts         # Test data generators
├── fixtures/                # Test fixtures
│   └── api-client.ts        # HTTP client for API testing
└── playwright.config.ts     # Playwright configuration
```

## Test Results

### Backend Readiness Tests ✅
- **Status**: All 15 tests passing
- **Coverage**: Health checks, CORS, server connectivity
- **Browser Support**: Chrome, Firefox, Safari

### API Integration Tests 🚧
- **Status**: 6 tests passing, 27 tests failing (expected)
- **Reason**: Backend API endpoints not implemented yet
- **Ready for**: Future API implementation

## Test Scenarios

Detailed test scenarios are documented in `.ai/test-scenarios/`:
- [Family Tree Creation Flow](../.ai/test-scenarios/01-family-tree-creation-flow.md)
- [Person Management Flow](../.ai/test-scenarios/02-person-management-flow.md)
- [Relationship Management Flow](../.ai/test-scenarios/03-relationship-management-flow.md)
- [Error Handling Scenarios](../.ai/test-scenarios/04-error-handling-scenarios.md)

## Writing Tests

### Page Objects
Use page objects to encapsulate page interactions:

```typescript
import { HomePage } from '../helpers/page-objects';

test('example test', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.createNewFamily();
});
```

### Test Data
Use test data generators for consistent test data:

```typescript
import { createTestPerson } from '../helpers/test-data';

const person = createTestPerson({
  firstName: 'John',
  lastName: 'Doe'
});
```

### API Testing
Use the API client for backend testing:

```typescript
import { ApiClient } from '../fixtures/api-client';

const apiClient = new ApiClient();
const response = await apiClient.healthCheck();
```

## CI/CD Integration

Tests run automatically on:
- Push to main/develop branches
- Pull requests

See `.github/workflows/e2e-tests.yml` for CI configuration.

## Configuration

### Environment Variables
- `API_BASE_URL`: Backend API URL (default: http://localhost:5001)
- `CI`: Enables CI-specific settings

### Playwright Config
- **Base URL**: Configurable for different environments
- **Browsers**: Chrome, Firefox, Safari
- **Parallelization**: Enabled for faster execution
- **Reports**: HTML reports with screenshots and videos

## Development Roadmap

### Next Steps (Backend API Implementation)
1. **Family Tree API**: CRUD operations for family trees
2. **Person API**: Person management within family trees
3. **Relationship API**: Managing relationships between persons
4. **Authentication**: User authentication and authorization

### Next Steps (Frontend Implementation)
1. **React Components**: Family tree visualization
2. **UI Forms**: Person and relationship management
3. **State Management**: Zustand store integration
4. **Responsive Design**: Mobile and desktop support

## Debugging

1. **Debug mode**: `npm run test:debug`
   - Opens Playwright Inspector
   - Step through tests
   - See browser state

2. **UI mode**: `npm run test:ui`
   - Interactive test runner
   - Time travel debugging
   - Watch mode

3. **Trace viewer**: 
   - Traces are captured on first retry
   - View with: `npx playwright show-trace trace.zip`

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Use Page Objects**: Encapsulate page interactions
3. **Generate Test Data**: Use unique data for each test
4. **Clean Up**: Remove test data after tests
5. **Wait Strategies**: Use Playwright's auto-waiting
6. **Assertions**: Use Playwright's web-first assertions

## Troubleshooting

### Tests failing locally
1. Ensure backend is running on correct port (5001)
2. Check network connectivity
3. Verify environment variables

### Tests failing in CI
1. Check artifacts for screenshots/videos
2. Review GitHub Actions logs
3. Ensure environment variables are set

### Backend connection issues
1. Verify backend server is running: `curl http://localhost:5001/health`
2. Check firewall settings
3. Verify port configuration matches

## Contributing

When adding new tests:
1. Follow existing patterns and structure
2. Add appropriate documentation
3. Ensure tests are independent and clean up after themselves
4. Update this README if adding new features or changing structure