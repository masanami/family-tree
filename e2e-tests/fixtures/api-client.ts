/**
 * API client helper for E2E tests
 * Provides methods to interact with backend API endpoints
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

export interface FamilyTree {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  id: string;
  familyTreeId: string;
  firstName: string;
  lastName?: string;
  birthDate?: string;
  deathDate?: string;
  gender?: 'male' | 'female' | 'other';
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Relationship {
  id: string;
  person1Id: string;
  person2Id: string;
  relationshipType: string;
  createdAt: string;
  updatedAt: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:5001') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic HTTP request method
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    // For basic health checks, use direct URL
    const url = endpoint === '/health' 
      ? `${this.baseUrl}${endpoint}` 
      : `${this.baseUrl}/api${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      const responseData = await response.json().catch(() => ({}));

      return {
        success: response.ok,
        data: responseData,
        statusCode: response.status,
        error: !response.ok ? responseData.message || 'Request failed' : undefined,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Family Tree API methods
  async getFamilyTrees(): Promise<ApiResponse<FamilyTree[]>> {
    return this.request<FamilyTree[]>('GET', '/family-trees');
  }

  async createFamilyTree(data: {
    name: string;
    description?: string;
  }): Promise<ApiResponse<FamilyTree>> {
    return this.request<FamilyTree>('POST', '/family-trees', data);
  }

  async getFamilyTree(id: string): Promise<ApiResponse<FamilyTree>> {
    return this.request<FamilyTree>('GET', `/family-trees/${id}`);
  }

  async updateFamilyTree(
    id: string,
    data: Partial<FamilyTree>
  ): Promise<ApiResponse<FamilyTree>> {
    return this.request<FamilyTree>('PUT', `/family-trees/${id}`, data);
  }

  async deleteFamilyTree(id: string): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/family-trees/${id}`);
  }

  // Person API methods
  async getPersons(familyTreeId: string): Promise<ApiResponse<Person[]>> {
    return this.request<Person[]>('GET', `/family-trees/${familyTreeId}/persons`);
  }

  async createPerson(
    familyTreeId: string,
    data: {
      firstName: string;
      lastName?: string;
      birthDate?: string;
      deathDate?: string;
      gender?: 'male' | 'female' | 'other';
      bio?: string;
    }
  ): Promise<ApiResponse<Person>> {
    return this.request<Person>('POST', `/family-trees/${familyTreeId}/persons`, data);
  }

  async getPerson(id: string): Promise<ApiResponse<Person>> {
    return this.request<Person>('GET', `/persons/${id}`);
  }

  async updatePerson(
    id: string,
    data: Partial<Person>
  ): Promise<ApiResponse<Person>> {
    return this.request<Person>('PUT', `/persons/${id}`, data);
  }

  async deletePerson(id: string): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/persons/${id}`);
  }

  // Relationship API methods (currently return 501)
  async createRelationship(data: {
    person1Id: string;
    person2Id: string;
    relationshipType: string;
  }): Promise<ApiResponse<Relationship>> {
    return this.request<Relationship>('POST', '/relationships', data);
  }

  async getRelationships(familyTreeId?: string): Promise<ApiResponse<Relationship[]>> {
    const endpoint = familyTreeId 
      ? `/relationships?familyTreeId=${familyTreeId}` 
      : '/relationships';
    return this.request<Relationship[]>('GET', endpoint);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>('GET', '/health');
  }

  // Test utility methods
  async waitForServer(timeoutMs: number = 30000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        const response = await this.healthCheck();
        if (response.success) {
          return true;
        }
      } catch (error) {
        // Server not ready, continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return false;
  }

  async cleanupTestData(familyTreeId?: string): Promise<void> {
    if (familyTreeId) {
      // Clean up specific family tree
      await this.deleteFamilyTree(familyTreeId);
    } else {
      // Clean up all test family trees (those with test prefix)
      const response = await this.getFamilyTrees();
      if (response.success && response.data) {
        for (const familyTree of response.data) {
          if (familyTree.name.startsWith('Test') || familyTree.name.startsWith('E2E')) {
            await this.deleteFamilyTree(familyTree.id);
          }
        }
      }
    }
  }
}