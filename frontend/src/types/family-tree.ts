import { Person } from './person';

export interface FamilyTreeNode {
  id: string;
  type: 'person';
  position: { x: number; y: number };
  data: {
    person: Person;
    isRoot?: boolean;
    generation?: number;
  };
}

export interface FamilyTreeEdge {
  id: string;
  source: string;
  target: string;
  type: 'family-relation';
  data: {
    relationType: 'parent-child' | 'spouse' | 'sibling';
    label?: string;
  };
}

export interface FamilyTreeData {
  nodes: FamilyTreeNode[];
  edges: FamilyTreeEdge[];
}

export interface FamilyTreeLayoutOptions {
  direction: 'TB' | 'BT' | 'LR' | 'RL'; // Top-Bottom, Bottom-Top, Left-Right, Right-Left
  nodeSpacing: {
    horizontal: number;
    vertical: number;
  };
  generationSpacing: number;
}