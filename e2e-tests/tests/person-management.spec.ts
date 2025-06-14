import { test, expect } from '@playwright/test';
import { FamilyTreePage, PersonFormPage } from '../helpers/page-objects';
import { createTestPerson, createTestFamily } from '../helpers/test-data';

test.describe('Person Management Flow', () => {
  let familyTreePage: FamilyTreePage;
  let personFormPage: PersonFormPage;
  
  // Setup: Create a test family before each test
  test.beforeEach(async ({ page }) => {
    familyTreePage = new FamilyTreePage(page);
    personFormPage = new PersonFormPage(page);
    
    // Navigate to test family (assume it exists or create it)
    // In real implementation, this would create a test family via API
    await page.goto('/family/test-family-id');
  });

  test('should add first person to family tree', async ({ page }) => {
    const testPerson = createTestPerson({
      firstName: 'John',
      lastName: 'Doe',
      birthDate: '1980-01-01',
      gender: 'male'
    });

    // Add person
    await familyTreePage.addPerson();
    
    // Fill person form
    await personFormPage.fillPersonForm(testPerson);
    await personFormPage.savePerson();

    // Verify person appears in tree
    await expect(page.getByText(`${testPerson.firstName} ${testPerson.lastName}`)).toBeVisible();
    
    // Verify person details on hover/click
    await page.getByText(`${testPerson.firstName} ${testPerson.lastName}`).click();
    await expect(page.getByText('Born: 1980-01-01')).toBeVisible();
  });

  test('should add multiple persons', async ({ page }) => {
    const persons = [
      createTestPerson({ firstName: 'John', lastName: 'Doe' }),
      createTestPerson({ firstName: 'Jane', lastName: 'Doe' }),
      createTestPerson({ firstName: 'Jim', lastName: 'Doe' })
    ];

    for (const person of persons) {
      await familyTreePage.addPerson();
      await personFormPage.fillPersonForm(person);
      await personFormPage.savePerson();
      
      // Verify person was added
      await expect(page.getByText(`${person.firstName} ${person.lastName}`)).toBeVisible();
    }

    // Verify all persons are visible
    for (const person of persons) {
      await expect(page.getByText(`${person.firstName} ${person.lastName}`)).toBeVisible();
    }
  });

  test('should edit person details', async ({ page }) => {
    // First add a person
    const person = createTestPerson({ 
      firstName: 'John', 
      lastName: 'Doe',
      birthDate: '1980-01-01'
    });
    
    await familyTreePage.addPerson();
    await personFormPage.fillPersonForm(person);
    await personFormPage.savePerson();

    // Edit the person
    await familyTreePage.openPersonDetails(`${person.firstName} ${person.lastName}`);
    
    // Update details
    await personFormPage.fillPersonForm({
      firstName: person.firstName,
      lastName: 'Smith', // Changed last name
      birthDate: person.birthDate || '',
      deathDate: '2020-12-31', // Added death date
      gender: person.gender
    });
    await personFormPage.savePerson();

    // Verify changes
    await expect(page.getByText('John Smith')).toBeVisible();
    await page.getByText('John Smith').click();
    await expect(page.getByText('Died: 2020-12-31')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await familyTreePage.addPerson();

    // Try to save without required fields
    await personFormPage.savePerson();
    
    // Verify validation errors
    await expect(page.getByText('First name is required')).toBeVisible();
    await expect(page.getByText('Last name is required')).toBeVisible();
  });

  test('should validate date logic', async ({ page }) => {
    await familyTreePage.addPerson();
    
    await personFormPage.fillPersonForm({
      firstName: 'Test',
      lastName: 'Person',
      birthDate: '2000-01-01',
      deathDate: '1999-01-01', // Death before birth
      gender: 'other'
    });
    
    await personFormPage.savePerson();
    
    // Verify validation error
    await expect(page.getByText(/Death date cannot be before birth date/i)).toBeVisible();
  });

  test('should delete person with confirmation', async ({ page }) => {
    // Add a person first
    const person = createTestPerson();
    await familyTreePage.addPerson();
    await personFormPage.fillPersonForm(person);
    await personFormPage.savePerson();

    // Open person details
    await familyTreePage.openPersonDetails(`${person.firstName} ${person.lastName}`);
    
    // Try to delete - first cancel
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Verify person still exists
    await expect(page.getByText(`${person.firstName} ${person.lastName}`)).toBeVisible();
    
    // Delete for real
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    
    // Verify person is removed
    await expect(page.getByText(`${person.firstName} ${person.lastName}`)).not.toBeVisible();
  });

  test('should search and filter persons', async ({ page }) => {
    // Add multiple persons
    const persons = [
      createTestPerson({ firstName: 'John', lastName: 'Smith' }),
      createTestPerson({ firstName: 'Jane', lastName: 'Doe' }),
      createTestPerson({ firstName: 'James', lastName: 'Johnson' }),
      createTestPerson({ firstName: 'Mary', lastName: 'Williams' })
    ];

    for (const person of persons) {
      await familyTreePage.addPerson();
      await personFormPage.fillPersonForm(person);
      await personFormPage.savePerson();
    }

    // Search by first name
    await familyTreePage.searchPerson('Ja');
    await expect(page.getByText('Jane Doe')).toBeVisible();
    await expect(page.getByText('James Johnson')).toBeVisible();
    await expect(page.getByText('John Smith')).not.toBeVisible();
    await expect(page.getByText('Mary Williams')).not.toBeVisible();

    // Clear search
    await familyTreePage.searchPerson('');
    
    // Verify all persons visible again
    for (const person of persons) {
      await expect(page.getByText(`${person.firstName} ${person.lastName}`)).toBeVisible();
    }
  });

  test('should handle large name inputs', async ({ page }) => {
    await familyTreePage.addPerson();
    
    const longName = 'a'.repeat(256);
    await personFormPage.fillPersonForm({
      firstName: longName,
      lastName: 'Test',
      gender: 'other'
    });
    
    await personFormPage.savePerson();
    
    // Verify error message
    await expect(page.getByText(/Name must be less than 255 characters/i)).toBeVisible();
  });

  test('should support quick actions', async ({ page }) => {
    // Add initial person
    const parent = createTestPerson({ firstName: 'Parent', lastName: 'Person' });
    await familyTreePage.addPerson();
    await personFormPage.fillPersonForm(parent);
    await personFormPage.savePerson();

    // Select the person
    await familyTreePage.selectPerson('Parent Person');
    
    // Use quick action to add child
    await page.getByRole('button', { name: 'Add Child' }).click();
    
    // Verify relationship is pre-selected
    await expect(page.getByLabel('Parent')).toHaveValue('Parent Person');
    
    // Fill child details
    await personFormPage.fillPersonForm({
      firstName: 'Child',
      lastName: 'Person',
      birthDate: '2010-01-01',
      gender: 'other'
    });
    await personFormPage.savePerson();
    
    // Verify both persons exist and are related
    await expect(page.getByText('Parent Person')).toBeVisible();
    await expect(page.getByText('Child Person')).toBeVisible();
  });
});