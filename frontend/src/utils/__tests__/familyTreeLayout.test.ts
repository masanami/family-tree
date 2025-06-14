import { describe, it, expect } from 'vitest';
import { 
  generateFamilyTreeLayout,
  calculateNodePositions,
  createFamilyTreeFromPersons,
  validateFamilyTreeData
} from '../familyTreeLayout';
import { Person } from '../../types/person';
import { FamilyTreeData, FamilyTreeLayoutOptions } from '../../types/family-tree';

describe('familyTreeLayout', () => {
  const mockPersons: Person[] = [
    {
      id: '1',
      firstName: '太郎',
      lastName: '山田',
      birthDate: '1960-01-01',
      gender: 'male'
    },
    {
      id: '2',
      firstName: '花子',
      lastName: '山田',
      birthDate: '1962-03-15',
      gender: 'female'
    },
    {
      id: '3',
      firstName: '次郎',
      lastName: '山田',
      birthDate: '1990-05-20',
      gender: 'male'
    }
  ];

  describe('generateFamilyTreeLayout', () => {
    it('should generate layout with top-bottom direction', () => {
      const layoutOptions: FamilyTreeLayoutOptions = {
        direction: 'TB',
        nodeSpacing: { horizontal: 200, vertical: 150 },
        generationSpacing: 200
      };

      const familyTreeData: FamilyTreeData = {
        nodes: [
          {
            id: '1',
            type: 'person',
            position: { x: 0, y: 0 },
            data: { person: mockPersons[0], isRoot: true, generation: 0 }
          },
          {
            id: '3',
            type: 'person',
            position: { x: 0, y: 0 },
            data: { person: mockPersons[2], generation: 1 }
          }
        ],
        edges: []
      };

      const result = generateFamilyTreeLayout(familyTreeData, layoutOptions);

      expect(result.nodes).toHaveLength(2);
      expect(result.nodes[0].position.y).toBeLessThan(result.nodes[1].position.y);
    });

    it('should generate layout with left-right direction', () => {
      const layoutOptions: FamilyTreeLayoutOptions = {
        direction: 'LR',
        nodeSpacing: { horizontal: 200, vertical: 150 },
        generationSpacing: 200
      };

      const familyTreeData: FamilyTreeData = {
        nodes: [
          {
            id: '1',
            type: 'person',
            position: { x: 0, y: 0 },
            data: { person: mockPersons[0], isRoot: true, generation: 0 }
          },
          {
            id: '3',
            type: 'person',
            position: { x: 0, y: 0 },
            data: { person: mockPersons[2], generation: 1 }
          }
        ],
        edges: []
      };

      const result = generateFamilyTreeLayout(familyTreeData, layoutOptions);

      expect(result.nodes).toHaveLength(2);
      expect(result.nodes[0].position.x).toBeLessThan(result.nodes[1].position.x);
    });
  });

  describe('calculateNodePositions', () => {
    it('should calculate positions based on generation and sibling order', () => {
      const nodes = [
        {
          id: '1',
          type: 'person' as const,
          position: { x: 0, y: 0 },
          data: { person: mockPersons[0], generation: 0 }
        },
        {
          id: '2',
          type: 'person' as const,
          position: { x: 0, y: 0 },
          data: { person: mockPersons[1], generation: 0 }
        },
        {
          id: '3',
          type: 'person' as const,
          position: { x: 0, y: 0 },
          data: { person: mockPersons[2], generation: 1 }
        }
      ];

      const layoutOptions: FamilyTreeLayoutOptions = {
        direction: 'TB',
        nodeSpacing: { horizontal: 200, vertical: 150 },
        generationSpacing: 200
      };

      const result = calculateNodePositions(nodes, layoutOptions);

      // Generation 0 should be at y=0, generation 1 at y=200
      const gen0Nodes = result.filter(n => n.data.generation === 0);
      const gen1Nodes = result.filter(n => n.data.generation === 1);

      expect(gen0Nodes.every(n => n.position.y === 0)).toBe(true);
      expect(gen1Nodes.every(n => n.position.y === 200)).toBe(true);

      // Siblings should be horizontally spaced
      expect(gen0Nodes[0].position.x).not.toBe(gen0Nodes[1].position.x);
    });

    it('should handle single node correctly', () => {
      const nodes = [
        {
          id: '1',
          type: 'person' as const,
          position: { x: 0, y: 0 },
          data: { person: mockPersons[0], generation: 0 }
        }
      ];

      const layoutOptions: FamilyTreeLayoutOptions = {
        direction: 'TB',
        nodeSpacing: { horizontal: 200, vertical: 150 },
        generationSpacing: 200
      };

      const result = calculateNodePositions(nodes, layoutOptions);

      expect(result).toHaveLength(1);
      expect(result[0].position.x).toBe(0);
      expect(result[0].position.y).toBe(0);
    });
  });

  describe('createFamilyTreeFromPersons', () => {
    it('should create family tree data from persons array', () => {
      const result = createFamilyTreeFromPersons(mockPersons, '1');

      expect(result.nodes).toHaveLength(3);
      expect(result.nodes.find(n => n.id === '1')?.data.isRoot).toBe(true);
      expect(result.nodes.every(n => n.type === 'person')).toBe(true);
    });

    it('should handle empty persons array', () => {
      const result = createFamilyTreeFromPersons([], '');

      expect(result.nodes).toHaveLength(0);
      expect(result.edges).toHaveLength(0);
    });

    it('should set correct root person', () => {
      const result = createFamilyTreeFromPersons(mockPersons, '2');

      const rootNode = result.nodes.find(n => n.data.isRoot);
      expect(rootNode?.id).toBe('2');
      expect(rootNode?.data.person.firstName).toBe('花子');
    });
  });

  describe('validateFamilyTreeData', () => {
    it('should validate correct family tree data', () => {
      const validData: FamilyTreeData = {
        nodes: [
          {
            id: '1',
            type: 'person',
            position: { x: 100, y: 100 },
            data: { person: mockPersons[0], generation: 0 }
          }
        ],
        edges: []
      };

      expect(() => validateFamilyTreeData(validData)).not.toThrow();
    });

    it('should throw error for invalid node structure', () => {
      const invalidData = {
        nodes: [
          {
            id: '1',
            type: 'person',
            // Missing position
            data: { person: mockPersons[0] }
          }
        ],
        edges: []
      } as FamilyTreeData;

      expect(() => validateFamilyTreeData(invalidData)).toThrow();
    });

    it('should throw error for edge referencing non-existent node', () => {
      const invalidData: FamilyTreeData = {
        nodes: [
          {
            id: '1',
            type: 'person',
            position: { x: 100, y: 100 },
            data: { person: mockPersons[0], generation: 0 }
          }
        ],
        edges: [
          {
            id: 'e1-2',
            source: '1',
            target: '2', // Node '2' doesn't exist
            type: 'family-relation',
            data: { relationType: 'parent-child' }
          }
        ]
      };

      expect(() => validateFamilyTreeData(invalidData)).toThrow('Edge references non-existent node');
    });

    it('should validate edge relation types', () => {
      const invalidData = {
        nodes: [
          {
            id: '1',
            type: 'person',
            position: { x: 100, y: 100 },
            data: { person: mockPersons[0], generation: 0 }
          },
          {
            id: '2',
            type: 'person',
            position: { x: 200, y: 100 },
            data: { person: mockPersons[1], generation: 0 }
          }
        ],
        edges: [
          {
            id: 'e1-2',
            source: '1',
            target: '2',
            type: 'family-relation',
            data: { relationType: 'invalid-relation' as any }
          }
        ]
      } as FamilyTreeData;

      expect(() => validateFamilyTreeData(invalidData)).toThrow('Invalid relation type');
    });
  });
});