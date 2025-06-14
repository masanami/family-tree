# Relationship Management Flow - E2E Test Scenarios

## Overview
This document describes the E2E test scenarios for relationship management functionality including creating, editing, viewing, and deleting relationships between persons in a family tree.

## Test Scenarios

### Scenario 1: Create Parent-Child Relationship - Happy Path
**Objective**: Verify user can create parent-child relationships

**Preconditions**:
- At least two persons exist in the family tree

**Test Steps**:
1. Select first person (Parent)
2. Click "Add Relationship" or drag to second person
3. Select relationship type "Parent of"
4. Select second person (Child)
5. Click "Save Relationship"
6. Verify relationship line appears in tree
7. Verify parent appears above child in hierarchy

**Expected Results**:
- Relationship is created successfully
- Tree reorganizes to show hierarchical structure
- Relationship is bidirectional (child shows parent, parent shows child)

### Scenario 2: Create Spouse Relationship
**Objective**: Verify user can create spouse relationships

**Test Steps**:
1. Select first person
2. Click "Add Spouse" quick action
3. Fill spouse details or select existing person
4. Click "Save"
5. Verify persons appear side-by-side
6. Verify spouse relationship line (usually horizontal)
7. Verify relationship dates can be added (marriage date)

### Scenario 3: Create Sibling Relationships
**Objective**: Verify sibling relationships through shared parents

**Test Steps**:
1. Create Parent person
2. Add first child to parent
3. Add second child to same parent
4. Verify both children shown as siblings
5. Verify sibling relationship is implicit through shared parent
6. Verify siblings appear at same level in tree

### Scenario 4: Complex Family Relationships
**Objective**: Verify handling of complex relationship scenarios

**Test Cases**:
1. **Multiple Marriages**:
   - Add person with first spouse
   - Add divorce/end date
   - Add second spouse
   - Verify both relationships shown
   - Verify timeline accuracy

2. **Step-Relationships**:
   - Create family with children
   - Add new spouse to one parent
   - Verify step-parent relationship
   - Verify step-sibling relationships

3. **Adopted Children**:
   - Add child with "Adopted" relationship type
   - Verify visual distinction (if any)
   - Verify relationship properties

### Scenario 5: Edit Relationship Details
**Objective**: Verify user can edit relationship properties

**Test Steps**:
1. Select existing relationship line/connection
2. Click "Edit" or right-click menu
3. Modify relationship details:
   - Start date
   - End date
   - Relationship notes
4. Save changes
5. Verify changes are reflected
6. Verify timeline view updates accordingly

### Scenario 6: Delete Relationships
**Objective**: Verify relationship deletion

**Test Steps**:
1. Select relationship to delete
2. Click "Delete Relationship"
3. Verify confirmation dialog
4. Confirm deletion
5. Verify relationship line removed
6. Verify persons still exist
7. Verify tree layout adjusts

### Scenario 7: Relationship Validation
**Objective**: Verify relationship rules and validation

**Test Cases**:
1. **Circular Relationships**:
   - Try to make person their own parent
   - Verify error: "A person cannot be their own ancestor"

2. **Impossible Relationships**:
   - Try to make child older than parent
   - Verify warning or error

3. **Duplicate Relationships**:
   - Try to create same relationship twice
   - Verify error: "This relationship already exists"

### Scenario 8: Bulk Relationship Creation
**Objective**: Verify efficient relationship creation

**Test Steps**:
1. Select multiple children (with Ctrl/Cmd+click)
2. Drag to parent
3. Verify option to create multiple parent-child relationships
4. Confirm bulk creation
5. Verify all relationships created correctly

### Scenario 9: Relationship View Modes
**Objective**: Verify relationships in different views

**Test Steps**:
1. Create complex family with multiple relationships
2. **Tree View**: Verify hierarchical lines
3. **Graph View**: Verify network-style connections
4. **List View**: Verify relationships shown in table
5. **Timeline View**: Verify relationships shown chronologically

### Scenario 10: Import/Export Relationships
**Objective**: Verify relationship data portability

**Test Steps**:
1. Export family tree with relationships
2. Verify export includes relationship data
3. Import to new family tree
4. Verify all relationships recreated correctly
5. Verify relationship properties preserved

## Advanced Features

### Scenario 11: Relationship Analytics
**Objective**: Verify relationship statistics and insights

**Test Steps**:
1. Create family with 20+ members
2. Access analytics/statistics view
3. Verify metrics:
   - Average children per family
   - Generation count
   - Relationship types breakdown
4. Verify visualizations render correctly

### Scenario 12: Relationship Conflicts
**Objective**: Verify handling of conflicting relationships

**Test Steps**:
1. Import data with conflicting relationships
2. Verify conflict detection
3. Verify conflict resolution options:
   - Keep existing
   - Replace with new
   - Merge information
4. Verify chosen resolution applies correctly

### Scenario 13: Performance with Many Relationships
**Objective**: Verify performance with complex relationship networks

**Test Steps**:
1. Create family with 100+ members
2. Create 200+ relationships
3. Verify tree rendering performance (<3 seconds)
4. Verify smooth interaction:
   - Hover effects
   - Click selection
   - Dragging/panning
5. Verify relationship lines don't overlap excessively

## Error Scenarios

### Scenario 14: Handle Missing Persons
**Objective**: Verify graceful handling when person is deleted

**Test Steps**:
1. Create relationship between two persons
2. Delete one person
3. Verify relationship is also removed
4. Verify no orphaned relationships
5. Verify tree remains stable

### Scenario 15: Network Errors During Relationship Operations
**Objective**: Verify error handling for connection issues

**Test Steps**:
1. Start creating relationship
2. Simulate network disconnection
3. Try to save relationship
4. Verify error message
5. Verify ability to retry when connected
6. Verify no duplicate relationships created

## Accessibility

### Scenario 16: Keyboard Relationship Management
**Objective**: Verify keyboard accessibility

**Test Steps**:
1. Select person with keyboard
2. Use keyboard shortcut to add relationship
3. Navigate relationship type with arrow keys
4. Tab to person selection
5. Use arrow keys to select target person
6. Save with Enter key
7. Verify entire flow possible without mouse