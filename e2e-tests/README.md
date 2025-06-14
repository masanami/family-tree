# E2E Tests for Family Tree Application

This directory contains end-to-end tests for the Family Tree application using Playwright.

## Setup

1. Install dependencies:
   ```bash
   npm install
   npx playwright install
   ```

2. Ensure the application is running:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:4000`

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

## Test Structure

```
e2e-tests/
├── tests/                    # Test files
│   ├── family-tree-creation.spec.ts
│   ├── person-management.spec.ts
│   └── relationship-management.spec.ts
├── helpers/                  # Helper functions
│   ├── page-objects.ts      # Page object models
│   └── test-data.ts         # Test data generators
├── fixtures/                # Test fixtures
└── playwright.config.ts     # Playwright configuration
```

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

## CI/CD Integration

Tests run automatically on:
- Push to main/develop branches
- Pull requests

See `.github/workflows/e2e-tests.yml` for CI configuration.

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
1. Ensure frontend and backend are running
2. Check correct URLs in `playwright.config.ts`
3. Clear test data: `npm run db:reset:test`

### Tests failing in CI
1. Check artifacts for screenshots/videos
2. Review GitHub Actions logs
3. Ensure environment variables are set

### Slow tests
1. Use `test.describe.parallel()` for parallel execution
2. Minimize test data creation
3. Use API for setup when possible