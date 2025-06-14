import { PrismaClient } from '@prisma/client';

interface SeedResult {
  familyTreesCreated: number;
  personsCreated: number;
  relationshipsCreated: number;
}

interface ClearResult {
  relationshipsDeleted: number;
  personsDeleted: number;
  familyTreesDeleted: number;
}

interface SampleData {
  familyTrees: Array<{
    name: string;
    description: string;
  }>;
  persons: Array<{
    firstName: string;
    lastName: string;
    birthDate?: Date;
    gender?: string;
    bio?: string;
  }>;
  relationships: Array<{
    person1Index: number;
    person2Index: number;
    relationshipType: string;
  }>;
}

export class SeedManager {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async seed(): Promise<SeedResult> {
    try {
      const sampleData = this.generateSampleData();
      let familyTreesCreated = 0;
      let personsCreated = 0;
      let relationshipsCreated = 0;

      // Create family trees
      const createdFamilyTrees = [];
      for (const treeData of sampleData.familyTrees) {
        const tree = await this.prisma.familyTree.create({
          data: treeData
        });
        createdFamilyTrees.push(tree);
        familyTreesCreated++;
      }

      // Create persons
      const createdPersons = [];
      for (const personData of sampleData.persons) {
        const person = await this.prisma.person.create({
          data: {
            ...personData,
            familyTreeId: createdFamilyTrees[0].id // Assign to first family tree
          }
        });
        createdPersons.push(person);
        personsCreated++;
      }

      // Create relationships
      for (const relationData of sampleData.relationships) {
        await this.prisma.relationship.create({
          data: {
            person1Id: createdPersons[relationData.person1Index].id,
            person2Id: createdPersons[relationData.person2Index].id,
            relationshipType: relationData.relationshipType
          }
        });
        relationshipsCreated++;
      }

      return {
        familyTreesCreated,
        personsCreated,
        relationshipsCreated
      };
    } catch (error) {
      throw new Error(`Failed to seed database: ${error}`);
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async clear(): Promise<ClearResult> {
    try {
      // Delete in correct order due to foreign key constraints
      const relationships = await this.prisma.relationship.deleteMany();
      const persons = await this.prisma.person.deleteMany();
      const familyTrees = await this.prisma.familyTree.deleteMany();

      return {
        relationshipsDeleted: relationships.count,
        personsDeleted: persons.count,
        familyTreesDeleted: familyTrees.count
      };
    } catch (error) {
      throw new Error(`Failed to clear database: ${error}`);
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async validateSeedData(): Promise<boolean> {
    const sampleData = this.generateSampleData();
    
    // Basic validation
    if (!sampleData.familyTrees.length) return false;
    if (!sampleData.persons.length) return false;
    if (!sampleData.relationships.length) return false;

    // Validate relationship indices
    for (const rel of sampleData.relationships) {
      if (rel.person1Index >= sampleData.persons.length) return false;
      if (rel.person2Index >= sampleData.persons.length) return false;
      if (rel.person1Index === rel.person2Index) return false;
    }

    return true;
  }

  generateSampleData(): SampleData {
    return {
      familyTrees: [
        {
          name: 'The Smith Family',
          description: 'A sample family tree showcasing three generations of the Smith family'
        },
        {
          name: 'The Johnson Family',
          description: 'Another sample family tree for testing purposes'
        }
      ],
      persons: [
        // Grandparents
        {
          firstName: 'Robert',
          lastName: 'Smith',
          birthDate: new Date('1940-05-15'),
          gender: 'male',
          bio: 'Family patriarch'
        },
        {
          firstName: 'Mary',
          lastName: 'Smith',
          birthDate: new Date('1942-08-20'),
          gender: 'female',
          bio: 'Family matriarch'
        },
        // Parents
        {
          firstName: 'John',
          lastName: 'Smith',
          birthDate: new Date('1965-03-10'),
          gender: 'male',
          bio: 'First child of Robert and Mary'
        },
        {
          firstName: 'Sarah',
          lastName: 'Smith',
          birthDate: new Date('1968-07-25'),
          gender: 'female',
          bio: 'Married into the Smith family'
        },
        // Children
        {
          firstName: 'Emma',
          lastName: 'Smith',
          birthDate: new Date('1995-11-05'),
          gender: 'female',
          bio: 'Eldest grandchild'
        },
        {
          firstName: 'Michael',
          lastName: 'Smith',
          birthDate: new Date('1998-02-18'),
          gender: 'male',
          bio: 'Youngest grandchild'
        }
      ],
      relationships: [
        // Robert and Mary are spouses
        { person1Index: 0, person2Index: 1, relationshipType: 'spouse' },
        // Robert is father of John
        { person1Index: 0, person2Index: 2, relationshipType: 'parent' },
        // Mary is mother of John
        { person1Index: 1, person2Index: 2, relationshipType: 'parent' },
        // John and Sarah are spouses
        { person1Index: 2, person2Index: 3, relationshipType: 'spouse' },
        // John is father of Emma
        { person1Index: 2, person2Index: 4, relationshipType: 'parent' },
        // Sarah is mother of Emma
        { person1Index: 3, person2Index: 4, relationshipType: 'parent' },
        // John is father of Michael
        { person1Index: 2, person2Index: 5, relationshipType: 'parent' },
        // Sarah is mother of Michael
        { person1Index: 3, person2Index: 5, relationshipType: 'parent' },
        // Emma and Michael are siblings
        { person1Index: 4, person2Index: 5, relationshipType: 'sibling' }
      ]
    };
  }
}