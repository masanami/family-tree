import request from 'supertest';
import { App } from '../../app';
import { Server } from 'http';
import { PrismaClient } from '@prisma/client';

describe('Person Routes Integration', () => {
  let app: App;
  let server: Server;
  let prisma: PrismaClient;
  let authToken: string;
  let userId: string;
  let familyTreeId: string;

  beforeAll(async () => {
    app = new App();
    server = app.getServer();
    prisma = new PrismaClient();
    
    // Clean up database
    await prisma.person.deleteMany();
    await prisma.familyTree.deleteMany();
    await prisma.user.deleteMany();
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
      },
    });
    userId = user.id;
    
    // Create test family tree
    const familyTree = await prisma.familyTree.create({
      data: {
        name: 'Test Family Tree',
        description: 'For person tests',
        isPublic: false,
        ownerId: userId,
      },
    });
    familyTreeId = familyTree.id;
    
    // Mock auth token
    authToken = 'Bearer mock-jwt-token';
  });

  afterAll(async () => {
    await prisma.person.deleteMany();
    await prisma.familyTree.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    if (server) {
      server.close();
    }
  });

  describe('POST /api/v1/family-trees/:familyTreeId/persons', () => {
    it('should create a new person', async () => {
      const newPerson = {
        firstName: '太郎',
        lastName: '田中',
        gender: 'male',
        birthDate: '1950-01-15',
        isLiving: true,
        birthPlace: '東京都',
        occupation: '医師',
      };

      const response = await request(server)
        .post(`/api/v1/family-trees/${familyTreeId}/persons`)
        .set('Authorization', authToken)
        .send(newPerson)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        familyTreeId,
        ...newPerson,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should create a deceased person', async () => {
      const deceasedPerson = {
        firstName: '次郎',
        lastName: '田中',
        gender: 'male',
        birthDate: '1920-03-10',
        isLiving: false,
        deathDate: '1995-12-25',
        deathPlace: '大阪府',
        birthPlace: '京都府',
      };

      const response = await request(server)
        .post(`/api/v1/family-trees/${familyTreeId}/persons`)
        .set('Authorization', authToken)
        .send(deceasedPerson)
        .expect(201);

      expect(response.body).toMatchObject({
        ...deceasedPerson,
        familyTreeId,
      });
    });

    it('should validate required fields', async () => {
      const invalidPerson = {
        lastName: '田中',
        // Missing firstName and gender
      };

      const response = await request(server)
        .post(`/api/v1/family-trees/${familyTreeId}/persons`)
        .set('Authorization', authToken)
        .send(invalidPerson)
        .expect(400);

      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error.errors).toHaveProperty('firstName');
      expect(response.body.error.errors).toHaveProperty('gender');
    });

    it('should validate gender values', async () => {
      const invalidGender = {
        firstName: '太郎',
        lastName: '田中',
        gender: 'invalid',
      };

      const response = await request(server)
        .post(`/api/v1/family-trees/${familyTreeId}/persons`)
        .set('Authorization', authToken)
        .send(invalidGender)
        .expect(400);

      expect(response.body.error.errors.gender).toContain('Gender must be male, female, or other');
    });

    it('should validate date formats', async () => {
      const invalidDates = {
        firstName: '太郎',
        lastName: '田中',
        gender: 'male',
        birthDate: 'invalid-date',
      };

      const response = await request(server)
        .post(`/api/v1/family-trees/${familyTreeId}/persons`)
        .set('Authorization', authToken)
        .send(invalidDates)
        .expect(400);

      expect(response.body.error.errors.birthDate).toBeDefined();
    });
  });

  describe('GET /api/v1/family-trees/:familyTreeId/persons', () => {
    beforeEach(async () => {
      // Create test persons
      await prisma.person.createMany({
        data: [
          {
            familyTreeId,
            firstName: '太郎',
            lastName: '山田',
            gender: 'male',
            birthDate: new Date('1950-01-01'),
            isLiving: true,
          },
          {
            familyTreeId,
            firstName: '花子',
            lastName: '山田',
            gender: 'female',
            birthDate: new Date('1952-05-15'),
            isLiving: true,
          },
          {
            familyTreeId,
            firstName: '一郎',
            lastName: '山田',
            gender: 'male',
            birthDate: new Date('1975-08-20'),
            isLiving: true,
          },
        ],
      });
    });

    afterEach(async () => {
      await prisma.person.deleteMany({ where: { familyTreeId } });
    });

    it('should list all persons in a family tree', async () => {
      const response = await request(server)
        .get(`/api/v1/family-trees/${familyTreeId}/persons`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.persons).toHaveLength(3);
      expect(response.body.total).toBe(3);
    });

    it('should search persons by name', async () => {
      const response = await request(server)
        .get(`/api/v1/family-trees/${familyTreeId}/persons?search=太郎`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.persons).toHaveLength(1);
      expect(response.body.persons[0].firstName).toBe('太郎');
    });

    it('should filter by gender', async () => {
      const response = await request(server)
        .get(`/api/v1/family-trees/${familyTreeId}/persons?gender=female`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.persons).toHaveLength(1);
      expect(response.body.persons[0].firstName).toBe('花子');
    });

    it('should filter by living status', async () => {
      // Add a deceased person
      await prisma.person.create({
        data: {
          familyTreeId,
          firstName: '祖父',
          lastName: '山田',
          gender: 'male',
          birthDate: new Date('1920-01-01'),
          isLiving: false,
          deathDate: new Date('1990-12-31'),
        },
      });

      const response = await request(server)
        .get(`/api/v1/family-trees/${familyTreeId}/persons?isLiving=false`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.persons).toHaveLength(1);
      expect(response.body.persons[0].firstName).toBe('祖父');
    });

    it('should sort persons by birth date', async () => {
      const response = await request(server)
        .get(`/api/v1/family-trees/${familyTreeId}/persons?sort=birthDate&order=asc`)
        .set('Authorization', authToken)
        .expect(200);

      const birthDates = response.body.persons.map((p: any) => p.birthDate);
      expect(birthDates).toEqual([...birthDates].sort());
    });
  });

  describe('GET /api/v1/family-trees/:familyTreeId/persons/:personId', () => {
    let personId: string;

    beforeEach(async () => {
      const person = await prisma.person.create({
        data: {
          familyTreeId,
          firstName: '太郎',
          lastName: '田中',
          gender: 'male',
          birthDate: new Date('1950-01-01'),
          isLiving: true,
          occupation: '医師',
          birthPlace: '東京都',
          notes: '家族の長',
        },
      });
      personId = person.id;
    });

    afterEach(async () => {
      await prisma.person.deleteMany({ where: { id: personId } });
    });

    it('should get a person by ID', async () => {
      const response = await request(server)
        .get(`/api/v1/family-trees/${familyTreeId}/persons/${personId}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toMatchObject({
        id: personId,
        firstName: '太郎',
        lastName: '田中',
        occupation: '医師',
        notes: '家族の長',
      });
    });

    it('should include relationships if requested', async () => {
      // Create another person and a relationship
      const spouse = await prisma.person.create({
        data: {
          familyTreeId,
          firstName: '花子',
          lastName: '田中',
          gender: 'female',
          birthDate: new Date('1952-05-15'),
          isLiving: true,
        },
      });

      await prisma.relationship.create({
        data: {
          familyTreeId,
          person1Id: personId,
          person2Id: spouse.id,
          relationshipType: 'spouse',
          startDate: new Date('1975-06-15'),
        },
      });

      const response = await request(server)
        .get(`/api/v1/family-trees/${familyTreeId}/persons/${personId}?includeRelationships=true`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.relationships).toHaveLength(1);
      expect(response.body.relationships[0].relationshipType).toBe('spouse');

      // Cleanup
      await prisma.relationship.deleteMany({ where: { familyTreeId } });
      await prisma.person.delete({ where: { id: spouse.id } });
    });

    it('should return 404 for non-existent person', async () => {
      await request(server)
        .get(`/api/v1/family-trees/${familyTreeId}/persons/non-existent`)
        .set('Authorization', authToken)
        .expect(404);
    });
  });

  describe('PUT /api/v1/family-trees/:familyTreeId/persons/:personId', () => {
    let personId: string;

    beforeEach(async () => {
      const person = await prisma.person.create({
        data: {
          familyTreeId,
          firstName: '太郎',
          lastName: '田中',
          gender: 'male',
          birthDate: new Date('1950-01-01'),
          isLiving: true,
        },
      });
      personId = person.id;
    });

    afterEach(async () => {
      await prisma.person.deleteMany({ where: { id: personId } });
    });

    it('should update person information', async () => {
      const updates = {
        occupation: 'シニアエンジニア',
        birthPlace: '東京都渋谷区',
        notes: '2024年に昇進',
      };

      const response = await request(server)
        .put(`/api/v1/family-trees/${familyTreeId}/persons/${personId}`)
        .set('Authorization', authToken)
        .send(updates)
        .expect(200);

      expect(response.body).toMatchObject({
        id: personId,
        ...updates,
      });
    });

    it('should update person to deceased', async () => {
      const deathInfo = {
        isLiving: false,
        deathDate: '2024-01-15',
        deathPlace: '病院',
      };

      const response = await request(server)
        .put(`/api/v1/family-trees/${familyTreeId}/persons/${personId}`)
        .set('Authorization', authToken)
        .send(deathInfo)
        .expect(200);

      expect(response.body.isLiving).toBe(false);
      expect(response.body.deathDate).toContain('2024-01-15');
      expect(response.body.deathPlace).toBe('病院');
    });

    it('should not allow changing familyTreeId', async () => {
      const invalidUpdate = {
        familyTreeId: 'different-tree-id',
      };

      const response = await request(server)
        .put(`/api/v1/family-trees/${familyTreeId}/persons/${personId}`)
        .set('Authorization', authToken)
        .send(invalidUpdate)
        .expect(400);

      expect(response.body.error.message).toContain('Cannot change family tree');
    });
  });

  describe('DELETE /api/v1/family-trees/:familyTreeId/persons/:personId', () => {
    let personId: string;

    beforeEach(async () => {
      const person = await prisma.person.create({
        data: {
          familyTreeId,
          firstName: '削除太郎',
          lastName: '田中',
          gender: 'male',
          birthDate: new Date('1950-01-01'),
          isLiving: true,
        },
      });
      personId = person.id;
    });

    it('should delete a person', async () => {
      await request(server)
        .delete(`/api/v1/family-trees/${familyTreeId}/persons/${personId}`)
        .set('Authorization', authToken)
        .expect(204);

      const deletedPerson = await prisma.person.findUnique({
        where: { id: personId },
      });
      expect(deletedPerson).toBeNull();
    });

    it('should cascade delete relationships', async () => {
      // Create another person and relationships
      const otherPerson = await prisma.person.create({
        data: {
          familyTreeId,
          firstName: '関係者',
          lastName: '田中',
          gender: 'female',
          birthDate: new Date('1952-01-01'),
          isLiving: true,
        },
      });

      const relationship = await prisma.relationship.create({
        data: {
          familyTreeId,
          person1Id: personId,
          person2Id: otherPerson.id,
          relationshipType: 'parent',
        },
      });

      const response = await request(server)
        .delete(`/api/v1/family-trees/${familyTreeId}/persons/${personId}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.affectedRelationships).toBe(1);

      // Verify relationship was deleted
      const deletedRel = await prisma.relationship.findUnique({
        where: { id: relationship.id },
      });
      expect(deletedRel).toBeNull();

      // Cleanup
      await prisma.person.delete({ where: { id: otherPerson.id } });
    });
  });

  describe('Bulk Operations', () => {
    it('should import persons from CSV', async () => {
      const csvContent = `firstName,lastName,gender,birthDate,isLiving,birthPlace,occupation
太郎,佐藤,male,1960-01-01,true,東京都,会社員
花子,佐藤,female,1962-03-15,true,大阪府,教師
一郎,佐藤,male,1985-07-20,true,東京都,エンジニア`;

      const response = await request(server)
        .post(`/api/v1/family-trees/${familyTreeId}/persons/import`)
        .set('Authorization', authToken)
        .attach('file', Buffer.from(csvContent), 'persons.csv')
        .expect(200);

      expect(response.body.imported).toBe(3);
      expect(response.body.failed).toBe(0);
      expect(response.body.persons).toHaveLength(3);

      // Cleanup
      await prisma.person.deleteMany({
        where: {
          familyTreeId,
          lastName: '佐藤',
        },
      });
    });

    it('should handle import errors gracefully', async () => {
      const invalidCsv = `firstName,lastName,gender,birthDate
,田中,invalid-gender,not-a-date
太郎,,male,1960-01-01
花子,山田,female,1962-03-15`;

      const response = await request(server)
        .post(`/api/v1/family-trees/${familyTreeId}/persons/import`)
        .set('Authorization', authToken)
        .attach('file', Buffer.from(invalidCsv), 'invalid.csv')
        .expect(200);

      expect(response.body.imported).toBe(1); // Only 花子 should be imported
      expect(response.body.failed).toBe(2);
      expect(response.body.errors).toHaveLength(2);

      // Cleanup
      await prisma.person.deleteMany({
        where: {
          familyTreeId,
          firstName: '花子',
          lastName: '山田',
        },
      });
    });

    it('should export persons to JSON', async () => {
      // Create test persons
      await prisma.person.createMany({
        data: [
          {
            familyTreeId,
            firstName: 'Export1',
            lastName: 'Test',
            gender: 'male',
            birthDate: new Date('1960-01-01'),
            isLiving: true,
          },
          {
            familyTreeId,
            firstName: 'Export2',
            lastName: 'Test',
            gender: 'female',
            birthDate: new Date('1962-01-01'),
            isLiving: true,
          },
        ],
      });

      const response = await request(server)
        .get(`/api/v1/family-trees/${familyTreeId}/persons/export?format=json`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.familyTreeId).toBe(familyTreeId);
      expect(response.body.exportDate).toBeDefined();
      expect(response.body.persons.length).toBeGreaterThanOrEqual(2);

      // Cleanup
      await prisma.person.deleteMany({
        where: {
          familyTreeId,
          lastName: 'Test',
        },
      });
    });
  });
});