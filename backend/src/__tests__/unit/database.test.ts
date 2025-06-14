import { DatabaseConnection } from '../../utils/database';

describe('Database Configuration', () => {
  let database: DatabaseConnection;

  beforeEach(() => {
    database = new DatabaseConnection();
  });

  afterEach(async () => {
    await database.disconnect();
  });

  describe('Prisma Initialization', () => {
    it('should create a Prisma client instance', () => {
      expect(database.client).toBeDefined();
      expect(database.client).toHaveProperty('$connect');
      expect(database.client).toHaveProperty('$disconnect');
    });

    it('should connect to the database successfully', async () => {
      await expect(database.connect()).resolves.not.toThrow();
      expect(database.client.$connect).toHaveBeenCalled();
    });

    it('should disconnect from the database successfully', async () => {
      await database.connect();
      await expect(database.disconnect()).resolves.not.toThrow();
      expect(database.client.$disconnect).toHaveBeenCalled();
    });

    it('should handle connection errors gracefully', async () => {
      const mockConnect = database.client.$connect as jest.Mock;
      mockConnect.mockRejectedValueOnce(new Error('Connection failed'));

      await expect(database.connect()).rejects.toThrow('Failed to connect to database');
    });
  });

  describe('Database Models', () => {
    it('should have FamilyTree model defined', () => {
      expect(database.client.familyTree).toBeDefined();
    });

    it('should have Person model defined', () => {
      expect(database.client.person).toBeDefined();
    });

    it('should have Relationship model defined', () => {
      expect(database.client.relationship).toBeDefined();
    });
  });
});