# Family Tree Creation Flow - E2E Test Scenarios

## Overview
This document describes the E2E test scenarios for the family tree creation flow.

## Test Scenarios

### Scenario 1: Create New Family Tree - Happy Path
**Objective**: Verify that a user can successfully create a new family tree

**Preconditions**:
- User is on the home page
- No existing family trees (or user can create multiple)

**Test Steps**:
1. Navigate to home page
2. Click "Create New Family Tree" button
3. Fill in family tree details:
   - Name: "Test Family Tree"
   - Description: "This is a test family tree"
4. Click "Create" button
5. Verify redirection to the new family tree page
6. Verify family tree name is displayed correctly
7. Verify empty tree message is shown

**Expected Results**:
- New family tree is created successfully
- User is redirected to the family tree view
- Family tree name is displayed in the header
- Empty state message is shown (e.g., "Start by adding your first family member")

### Scenario 2: Create Family Tree - Validation Errors
**Objective**: Verify form validation for family tree creation

**Test Cases**:
1. **Empty Name**:
   - Leave name field empty
   - Click "Create"
   - Verify error message: "Family name is required"

2. **Name Too Long**:
   - Enter name with 256+ characters
   - Click "Create"
   - Verify error message: "Family name must be less than 255 characters"

3. **Duplicate Name** (if applicable):
   - Create family with name "Existing Family"
   - Try to create another family with same name
   - Verify error message: "A family with this name already exists"

### Scenario 3: Cancel Family Tree Creation
**Objective**: Verify user can cancel family tree creation

**Test Steps**:
1. Navigate to home page
2. Click "Create New Family Tree" button
3. Fill in some details
4. Click "Cancel" button
5. Verify return to home page
6. Verify no new family tree was created

### Scenario 4: Create Multiple Family Trees
**Objective**: Verify user can create and manage multiple family trees

**Test Steps**:
1. Create first family tree "Family A"
2. Return to home page
3. Create second family tree "Family B"
4. Return to home page
5. Verify both family trees are listed
6. Verify user can open each family tree

## Error Scenarios

### Scenario 5: Network Error During Creation
**Objective**: Verify graceful handling of network errors

**Test Steps**:
1. Start family tree creation
2. Simulate network failure (offline mode)
3. Click "Create"
4. Verify error message is displayed
5. Verify user can retry when network is restored

### Scenario 6: Server Error During Creation
**Objective**: Verify handling of server errors

**Test Steps**:
1. Start family tree creation
2. Mock server to return 500 error
3. Click "Create"
4. Verify error message: "An error occurred. Please try again later."
5. Verify form data is preserved

## Data Management

### Test Data Cleanup
- Each test should clean up created family trees after completion
- Use unique timestamps in family names to avoid conflicts
- Implement cleanup in test teardown hooks

### Test Isolation
- Tests should be independent and runnable in any order
- Each test creates its own test data
- No dependencies between test scenarios