/**
 * Test data helper functions for E2E tests
 */

export interface TestPerson {
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  gender: 'male' | 'female' | 'other';
}

export interface TestFamily {
  name: string;
  description?: string;
}

/**
 * Generate test person data
 */
export function createTestPerson(overrides?: Partial<TestPerson>): TestPerson {
  const timestamp = Date.now();
  return {
    firstName: `TestFirst${timestamp}`,
    lastName: `TestLast${timestamp}`,
    gender: 'other',
    ...overrides
  };
}

/**
 * Generate test family data
 */
export function createTestFamily(overrides?: Partial<TestFamily>): TestFamily {
  const timestamp = Date.now();
  return {
    name: `Test Family ${timestamp}`,
    description: 'A test family tree created for E2E testing',
    ...overrides
  };
}

/**
 * Generate multiple test persons
 */
export function createTestPersons(count: number, baseOverrides?: Partial<TestPerson>): TestPerson[] {
  return Array.from({ length: count }, (_, index) => 
    createTestPerson({
      ...baseOverrides,
      firstName: `${baseOverrides?.firstName || 'TestFirst'}${index + 1}`,
      lastName: `${baseOverrides?.lastName || 'TestLast'}${index + 1}`
    })
  );
}

/**
 * Test data for relationships
 */
export const RELATIONSHIP_TYPES = {
  PARENT_CHILD: 'parent_child',
  SPOUSE: 'spouse',
  SIBLING: 'sibling'
} as const;

/**
 * Clean up test data (to be implemented with API)
 */
export async function cleanupTestData(familyId: string): Promise<void> {
  // This will be implemented once the API is available
  // It should delete the test family and all associated data
  console.log(`Cleanup for family ${familyId} - to be implemented`);
}