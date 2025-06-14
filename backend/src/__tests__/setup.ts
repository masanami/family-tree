// Mock Prisma Client for testing
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    familyTree: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn()
    },
    person: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn()
    },
    relationship: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn()
    }
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    __mockPrismaClient: mockPrismaClient
  };
});

// Clean up after tests
afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});