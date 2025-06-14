# Person Management Flow - E2E Test Scenarios

## Overview
This document describes the E2E test scenarios for person management functionality including creating, editing, viewing, and deleting persons in a family tree.

## Test Scenarios

### Scenario 1: Add First Person - Happy Path
**Objective**: Verify user can add the first person to a family tree

**Preconditions**:
- User has created a family tree
- Family tree is empty

**Test Steps**:
1. Open family tree
2. Click "Add Person" button
3. Fill person details:
   - First Name: "John"
   - Last Name: "Doe"
   - Birth Date: "1980-01-01"
   - Gender: "Male"
4. Click "Save" button
5. Verify person appears in tree view
6. Verify person details are displayed correctly

**Expected Results**:
- Person is added successfully
- Person node appears in tree view
- Person details match input data

### Scenario 2: Add Multiple Persons
**Objective**: Verify user can add multiple persons

**Test Steps**:
1. Add first person (John Doe)
2. Click "Add Person" again
3. Add second person (Jane Doe)
4. Add third person (Jim Doe)
5. Verify all three persons appear in tree
6. Verify persons can be selected individually

### Scenario 3: Edit Person Details
**Objective**: Verify user can edit existing person's information

**Test Steps**:
1. Select existing person (John Doe)
2. Click "Edit" button or double-click person
3. Modify details:
   - Add Death Date: "2020-12-31"
   - Change Last Name: "Smith"
4. Click "Save" button
5. Verify changes are reflected in tree
6. Verify changes persist after page refresh

### Scenario 4: Person Form Validation
**Objective**: Verify form validation rules

**Test Cases**:
1. **Required Fields**:
   - Try to save without First Name
   - Verify error: "First name is required"
   - Try to save without Last Name
   - Verify error: "Last name is required"

2. **Date Validation**:
   - Enter death date before birth date
   - Verify error: "Death date cannot be before birth date"
   - Enter future birth date
   - Verify warning or error

3. **Character Limits**:
   - Enter 256+ character names
   - Verify appropriate error messages

### Scenario 5: Delete Person
**Objective**: Verify person deletion functionality

**Test Steps**:
1. Select person to delete
2. Click "Delete" button
3. Verify confirmation dialog appears
4. Click "Cancel" - verify person still exists
5. Click "Delete" again
6. Click "Confirm" in dialog
7. Verify person is removed from tree
8. Verify associated relationships are also removed

### Scenario 6: Search and Filter Persons
**Objective**: Verify search functionality

**Test Steps**:
1. Add multiple persons (10+)
2. Use search box to search by:
   - First name
   - Last name
   - Full name
3. Verify search results update in real-time
4. Verify clicking search result selects person in tree
5. Clear search and verify all persons shown

### Scenario 7: Person Quick Actions
**Objective**: Verify quick action buttons work correctly

**Test Steps**:
1. Select a person
2. Test quick actions:
   - Add Parent
   - Add Child
   - Add Spouse
3. Verify each action opens form with relationship pre-selected
4. Complete adding related person
5. Verify relationship is created automatically

## View Modes

### Scenario 8: Different View Modes
**Objective**: Verify person display in different views

**Test Steps**:
1. Add multiple persons with relationships
2. Switch to Tree View - verify hierarchical display
3. Switch to List View - verify tabular display
4. Switch to Timeline View - verify chronological display
5. Verify person selection syncs across views

## Data Import/Export

### Scenario 9: Import Persons from File
**Objective**: Verify bulk import functionality

**Test Steps**:
1. Prepare CSV/JSON file with person data
2. Click "Import" button
3. Select file
4. Review import preview
5. Confirm import
6. Verify all persons imported correctly
7. Verify relationships imported (if applicable)

### Scenario 10: Export Person Data
**Objective**: Verify export functionality

**Test Steps**:
1. Select persons to export (or all)
2. Click "Export" button
3. Choose format (CSV/JSON/PDF)
4. Verify file downloads
5. Verify exported data is complete and correct

## Error Handling

### Scenario 11: Handle Duplicate Persons
**Objective**: Verify system handles potential duplicates

**Test Steps**:
1. Add person "John Doe" born "1980-01-01"
2. Try to add another "John Doe" with same birth date
3. Verify warning: "A person with similar details already exists"
4. Verify option to continue or cancel
5. If continued, verify both persons are created

### Scenario 12: Network Errors
**Objective**: Verify graceful handling of connection issues

**Test Steps**:
1. Start editing a person
2. Simulate network disconnection
3. Try to save changes
4. Verify error message
5. Verify data is not lost
6. Restore connection and retry save
7. Verify changes are saved successfully

## Performance

### Scenario 13: Large Family Tree Performance
**Objective**: Verify performance with many persons

**Test Steps**:
1. Import or create 100+ persons
2. Verify tree loads within acceptable time (<3 seconds)
3. Verify smooth scrolling and zooming
4. Verify search remains responsive
5. Verify person selection is instant

## Accessibility

### Scenario 14: Keyboard Navigation
**Objective**: Verify keyboard accessibility

**Test Steps**:
1. Navigate to person using Tab key
2. Select person using Enter/Space
3. Open edit form using Enter
4. Navigate form fields using Tab
5. Save using Ctrl/Cmd+S or Enter
6. Cancel using Escape
7. Verify all actions possible without mouse