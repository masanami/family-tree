import { Request, Response, NextFunction } from 'express';
import { RelationshipController } from '../../../controllers/relationship.controller';
import { RelationshipService } from '../../../services/relationship.service';

// Mock the service
jest.mock('../../../services/relationship.service');

describe('RelationshipController', () => {
  let controller: RelationshipController;
  let mockService: jest.Mocked<RelationshipService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    // Initialize mocks
    mockService = new RelationshipService() as jest.Mocked<RelationshipService>;
    controller = new RelationshipController(mockService);
    
    responseJson = jest.fn();
    responseStatus = jest.fn().mockReturnValue({ json: responseJson });
    mockResponse = {
      status: responseStatus,
      json: responseJson,
      sendStatus: jest.fn()
    };
    mockNext = jest.fn();
    mockRequest = {
      params: {},
      body: {},
      query: {}
    };
  });

  describe('getRelationshipsByFamilyTree', () => {
    it('should return relationships for a family tree', async () => {
      const treeId = 'test-tree-id';
      const mockRelationships = [
        {
          id: '1',
          person1Id: 'p1',
          person2Id: 'p2',
          relationshipType: 'spouse',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRequest.params = { treeId };
      mockRequest.query = { page: '1', limit: '10' };

      mockService.getByFamilyTree.mockResolvedValue({
        data: mockRelationships,
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      });

      await controller.getRelationshipsByFamilyTree(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockService.getByFamilyTree).toHaveBeenCalledWith(treeId, 1, 10);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        data: mockRelationships,
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      });
    });

    it('should handle errors', async () => {
      mockRequest.params = { treeId: 'test-tree-id' };
      mockService.getByFamilyTree.mockRejectedValue(new Error('Database error'));

      await controller.getRelationshipsByFamilyTree(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('createRelationship', () => {
    it('should create a new relationship', async () => {
      const treeId = 'test-tree-id';
      const relationshipData = {
        person1Id: 'p1',
        person2Id: 'p2',
        relationshipType: 'parent'
      };
      const createdRelationship = {
        id: 'new-id',
        ...relationshipData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest.params = { treeId };
      mockRequest.body = relationshipData;

      mockService.create.mockResolvedValue(createdRelationship);

      await controller.createRelationship(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockService.create).toHaveBeenCalledWith(treeId, relationshipData);
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith({
        data: createdRelationship
      });
    });
  });

  describe('updateRelationship', () => {
    it('should update a relationship', async () => {
      const relationshipId = 'rel-id';
      const updateData = { relationshipType: 'sibling' };
      const updatedRelationship = {
        id: relationshipId,
        person1Id: 'p1',
        person2Id: 'p2',
        relationshipType: 'sibling',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest.params = { id: relationshipId };
      mockRequest.body = updateData;

      mockService.update.mockResolvedValue(updatedRelationship);

      await controller.updateRelationship(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockService.update).toHaveBeenCalledWith(relationshipId, updateData);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        data: updatedRelationship
      });
    });
  });

  describe('deleteRelationship', () => {
    it('should delete a relationship', async () => {
      const relationshipId = 'rel-id';
      mockRequest.params = { id: relationshipId };

      mockService.delete.mockResolvedValue(undefined);

      await controller.deleteRelationship(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockService.delete).toHaveBeenCalledWith(relationshipId);
      expect(mockResponse.sendStatus).toHaveBeenCalledWith(204);
    });
  });
});