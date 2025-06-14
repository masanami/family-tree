import { PrismaClient, Relationship } from '@prisma/client';
import { ApiError } from '../middleware/error-handler';

interface CreateRelationshipDto {
  person1Id: string;
  person2Id: string;
  relationshipType: string;
}

interface UpdateRelationshipDto {
  person1Id?: string;
  person2Id?: string;
  relationshipType?: string;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class RelationshipService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getByFamilyTree(
    familyTreeId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<PaginatedResult<Relationship>> {
    // First check if family tree exists
    const familyTree = await this.prisma.familyTree.findUnique({
      where: { id: familyTreeId }
    });

    if (!familyTree) {
      throw new ApiError(404, 'Family tree not found');
    }

    // Get relationships through persons in the family tree
    const skip = (page - 1) * limit;
    
    // Get all persons in the family tree
    const personsInTree = await this.prisma.person.findMany({
      where: { familyTreeId },
      select: { id: true }
    });
    
    const personIds = personsInTree.map(p => p.id);

    // Get relationships where both persons belong to this family tree
    const [relationships, total] = await Promise.all([
      this.prisma.relationship.findMany({
        where: {
          OR: [
            { person1Id: { in: personIds }, person2Id: { in: personIds } }
          ]
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.relationship.count({
        where: {
          OR: [
            { person1Id: { in: personIds }, person2Id: { in: personIds } }
          ]
        }
      })
    ]);

    return {
      data: relationships,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async create(familyTreeId: string, data: CreateRelationshipDto): Promise<Relationship> {
    // Validate that both persons exist and belong to the same family tree
    const [person1, person2] = await Promise.all([
      this.prisma.person.findUnique({ where: { id: data.person1Id } }),
      this.prisma.person.findUnique({ where: { id: data.person2Id } })
    ]);

    if (!person1 || !person2) {
      throw new ApiError(400, 'Invalid person IDs');
    }

    if (person1.familyTreeId !== familyTreeId || person2.familyTreeId !== familyTreeId) {
      throw new ApiError(400, 'Persons must belong to the same family tree');
    }

    // Check for duplicate relationship
    const existing = await this.prisma.relationship.findFirst({
      where: {
        person1Id: data.person1Id,
        person2Id: data.person2Id,
        relationshipType: data.relationshipType
      }
    });

    if (existing) {
      throw new ApiError(409, 'Relationship already exists');
    }

    return this.prisma.relationship.create({
      data: {
        person1Id: data.person1Id,
        person2Id: data.person2Id,
        relationshipType: data.relationshipType
      }
    });
  }

  async update(id: string, data: UpdateRelationshipDto): Promise<Relationship> {
    // Check if relationship exists
    const existing = await this.prisma.relationship.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new ApiError(404, 'Relationship not found');
    }

    // If updating person IDs, validate they exist and belong to same family tree
    if (data.person1Id || data.person2Id) {
      const person1Id = data.person1Id || existing.person1Id;
      const person2Id = data.person2Id || existing.person2Id;

      const [person1, person2] = await Promise.all([
        this.prisma.person.findUnique({ where: { id: person1Id } }),
        this.prisma.person.findUnique({ where: { id: person2Id } })
      ]);

      if (!person1 || !person2) {
        throw new ApiError(400, 'Invalid person IDs');
      }

      if (person1.familyTreeId !== person2.familyTreeId) {
        throw new ApiError(400, 'Persons must belong to the same family tree');
      }
    }

    return this.prisma.relationship.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.relationship.delete({
        where: { id }
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new ApiError(404, 'Relationship not found');
      }
      throw error;
    }
  }
}