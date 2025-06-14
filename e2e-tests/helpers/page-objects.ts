/**
 * Page object helpers for E2E tests
 */
import { Page, Locator } from '@playwright/test';

/**
 * Base page object with common functionality
 */
export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string = '') {
    await this.page.goto(path);
  }

  async waitForLoadComplete() {
    await this.page.waitForLoadState('networkidle');
  }

  async clickButton(text: string) {
    await this.page.getByRole('button', { name: text }).click();
  }

  async fillInput(label: string, value: string) {
    await this.page.getByLabel(label).fill(value);
  }

  async selectOption(label: string, value: string) {
    await this.page.getByLabel(label).selectOption(value);
  }

  async getErrorMessage(): Promise<string | null> {
    const error = this.page.getByRole('alert');
    if (await error.isVisible()) {
      return await error.textContent();
    }
    return null;
  }

  async waitForToast(message: string) {
    await this.page.getByText(message).waitFor({ state: 'visible' });
  }
}

/**
 * Home page object
 */
export class HomePage extends BasePage {
  async createNewFamily() {
    await this.clickButton('Create New Family Tree');
  }

  async openFamily(familyName: string) {
    await this.page.getByText(familyName).click();
  }

  async searchFamily(query: string) {
    await this.fillInput('Search families', query);
  }
}

/**
 * Family tree page object
 */
export class FamilyTreePage extends BasePage {
  async addPerson() {
    await this.clickButton('Add Person');
  }

  async selectPerson(name: string) {
    await this.page.getByText(name).click();
  }

  async openPersonDetails(name: string) {
    await this.selectPerson(name);
    await this.page.getByText(name).dblclick();
  }

  async searchPerson(query: string) {
    await this.fillInput('Search persons', query);
  }

  async changeView(viewType: 'tree' | 'list' | 'timeline') {
    await this.page.getByRole('tab', { name: viewType }).click();
  }

  async zoomIn() {
    await this.page.getByLabel('Zoom in').click();
  }

  async zoomOut() {
    await this.page.getByLabel('Zoom out').click();
  }

  async resetZoom() {
    await this.page.getByLabel('Reset zoom').click();
  }
}

/**
 * Person form page object
 */
export class PersonFormPage extends BasePage {
  async fillPersonForm(data: {
    firstName: string;
    lastName: string;
    birthDate?: string;
    deathDate?: string;
    gender: string;
  }) {
    await this.fillInput('First Name', data.firstName);
    await this.fillInput('Last Name', data.lastName);
    
    if (data.birthDate) {
      await this.fillInput('Birth Date', data.birthDate);
    }
    
    if (data.deathDate) {
      await this.fillInput('Death Date', data.deathDate);
    }
    
    await this.selectOption('Gender', data.gender);
  }

  async savePerson() {
    await this.clickButton('Save');
  }

  async cancelForm() {
    await this.clickButton('Cancel');
  }

  async deletePerson() {
    await this.clickButton('Delete');
    // Confirm deletion
    await this.page.getByRole('button', { name: 'Confirm' }).click();
  }
}

/**
 * Relationship form page object
 */
export class RelationshipFormPage extends BasePage {
  async selectPersons(person1: string, person2: string) {
    await this.selectOption('Person 1', person1);
    await this.selectOption('Person 2', person2);
  }

  async selectRelationshipType(type: string) {
    await this.selectOption('Relationship Type', type);
  }

  async saveRelationship() {
    await this.clickButton('Save Relationship');
  }

  async cancelForm() {
    await this.clickButton('Cancel');
  }
}