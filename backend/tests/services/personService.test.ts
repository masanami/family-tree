import { PersonService } from '../../src/services/personService';
import pool from '../../src/config/database';
import { CreatePersonDto } from '../../src/types/models';

// Mock the database pool
jest.mock('../../src/config/database', () => ({
  query: jest.fn()
}));

describe('PersonService', () => {
  let personService: PersonService;
  const mockQuery = pool.query as jest.MockedFunction<typeof pool.query>;

  beforeEach(() => {
    personService = new PersonService();
    jest.clearAllMocks();
  });

  describe('getAllPersons', () => {
    it('should return all persons ordered by last name and first name', async () => {
      const mockPersons = [
        { id: '1', first_name: 'John', last_name: 'Doe' },
        { id: '2', first_name: 'Jane', last_name: 'Smith' }
      ];
      mockQuery.mockResolvedValueOnce({ rows: mockPersons } as any);

      const result = await personService.getAllPersons();

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY last_name, first_name')
      );
      expect(result).toEqual(mockPersons);
    });
  });

  describe('getPersonById', () => {
    it('should return a person by ID', async () => {
      const mockPerson = { id: '1', first_name: 'John', last_name: 'Doe' };
      mockQuery.mockResolvedValueOnce({ rows: [mockPerson] } as any);

      const result = await personService.getPersonById('1');

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM persons WHERE id = $1',
        ['1']
      );
      expect(result).toEqual(mockPerson);
    });

    it('should return null if person not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      const result = await personService.getPersonById('999');

      expect(result).toBeNull();
    });
  });

  describe('createPerson', () => {
    it('should create a new person', async () => {
      const createDto: CreatePersonDto = {
        first_name: 'John',
        last_name: 'Doe',
        birth_date: new Date('1990-01-01')
      };
      const mockCreatedPerson = { id: '1', ...createDto };
      mockQuery.mockResolvedValueOnce({ rows: [mockCreatedPerson] } as any);

      const result = await personService.createPerson(createDto);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO persons'),
        expect.arrayContaining(['John', null, 'Doe'])
      );
      expect(result).toEqual(mockCreatedPerson);
    });
  });

  describe('updatePerson', () => {
    it('should update a person', async () => {
      const updateData = { first_name: 'Jane' };
      const mockUpdatedPerson = { id: '1', first_name: 'Jane', last_name: 'Doe' };
      mockQuery.mockResolvedValueOnce({ rows: [mockUpdatedPerson] } as any);

      const result = await personService.updatePerson('1', updateData);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE persons'),
        expect.arrayContaining(['Jane', '1'])
      );
      expect(result).toEqual(mockUpdatedPerson);
    });

    it('should return existing person if no fields to update', async () => {
      const mockPerson = { id: '1', first_name: 'John', last_name: 'Doe' };
      mockQuery.mockResolvedValueOnce({ rows: [mockPerson] } as any);

      const result = await personService.updatePerson('1', {});

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM persons WHERE id = $1',
        ['1']
      );
      expect(result).toEqual(mockPerson);
    });
  });

  describe('deletePerson', () => {
    it('should delete a person and return true', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 } as any);

      const result = await personService.deletePerson('1');

      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM persons WHERE id = $1',
        ['1']
      );
      expect(result).toBe(true);
    });

    it('should return false if person not found', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 } as any);

      const result = await personService.deletePerson('999');

      expect(result).toBe(false);
    });
  });

  describe('searchPersons', () => {
    it('should search persons by various fields', async () => {
      const mockPersons = [
        { id: '1', first_name: 'John', last_name: 'Doe' }
      ];
      mockQuery.mockResolvedValueOnce({ rows: mockPersons } as any);

      const result = await personService.searchPersons('john');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(first_name) LIKE LOWER($1)'),
        ['%john%']
      );
      expect(result).toEqual(mockPersons);
    });
  });
});