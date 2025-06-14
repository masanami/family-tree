import { Person } from '../types/person';
import { FamilyTreeData, FamilyTreeNode, FamilyTreeEdge, FamilyTreeLayoutOptions } from '../types/family-tree';

// Layout generation with input validation and memoization
const layoutCache = new Map<string, FamilyTreeData>();

export function generateFamilyTreeLayout(
  familyTreeData: FamilyTreeData,
  layoutOptions: FamilyTreeLayoutOptions
): FamilyTreeData {
  const { nodes, edges } = familyTreeData;
  
  // Early return for empty data
  if (nodes.length === 0) {
    return { nodes: [], edges };
  }
  
  // Create cache key for layout memoization
  const layoutCacheKey = `layout-${createCacheKey(nodes, layoutOptions)}`;
  const cached = layoutCache.get(layoutCacheKey);
  if (cached) {
    return cached;
  }
  
  // Calculate new positions based on layout options
  const layoutedNodes = calculateNodePositions(nodes, layoutOptions);
  
  const result = {
    nodes: layoutedNodes,
    edges
  };
  
  // Cache the result
  layoutCache.set(layoutCacheKey, result);
  
  // Prevent memory leaks
  if (layoutCache.size > 50) {
    const firstKey = layoutCache.keys().next().value;
    layoutCache.delete(firstKey);
  }
  
  return result;
}

// Memoization cache for performance optimization
const positionCache = new Map<string, FamilyTreeNode[]>();

function createCacheKey(nodes: FamilyTreeNode[], layoutOptions: FamilyTreeLayoutOptions): string {
  const nodeIds = nodes.map(n => `${n.id}-${n.data.generation}`).sort().join(',');
  const optionsKey = `${layoutOptions.direction}-${layoutOptions.nodeSpacing.horizontal}-${layoutOptions.nodeSpacing.vertical}-${layoutOptions.generationSpacing}`;
  return `${nodeIds}|${optionsKey}`;
}

export function calculateNodePositions(
  nodes: FamilyTreeNode[],
  layoutOptions: FamilyTreeLayoutOptions
): FamilyTreeNode[] {
  if (nodes.length === 0) return nodes;
  
  // Check cache first
  const cacheKey = createCacheKey(nodes, layoutOptions);
  const cached = positionCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  const { direction, nodeSpacing, generationSpacing } = layoutOptions;
  
  // Group nodes by generation (optimized with Map)
  const nodesByGeneration = new Map<number, FamilyTreeNode[]>();
  
  for (const node of nodes) {
    const generation = node.data.generation || 0;
    const generationNodes = nodesByGeneration.get(generation);
    if (generationNodes) {
      generationNodes.push(node);
    } else {
      nodesByGeneration.set(generation, [node]);
    }
  }
  
  const layoutedNodes: FamilyTreeNode[] = [];
  
  // Calculate positions for each generation (optimized loops)
  for (const [generation, generationNodes] of nodesByGeneration) {
    const isVertical = direction === 'TB' || direction === 'BT';
    const nodeCount = generationNodes.length;
    
    for (let index = 0; index < nodeCount; index++) {
      const node = generationNodes[index];
      const newNode = { ...node };
      
      if (isVertical) {
        // Top-Bottom or Bottom-Top layout
        const totalWidth = (nodeCount - 1) * nodeSpacing.horizontal;
        const startX = -totalWidth / 2;
        
        newNode.position = {
          x: startX + (index * nodeSpacing.horizontal),
          y: generation * generationSpacing
        };
        
        if (direction === 'BT') {
          newNode.position.y = -newNode.position.y;
        }
      } else {
        // Left-Right or Right-Left layout
        const totalHeight = (nodeCount - 1) * nodeSpacing.vertical;
        const startY = -totalHeight / 2;
        
        newNode.position = {
          x: generation * generationSpacing,
          y: startY + (index * nodeSpacing.vertical)
        };
        
        if (direction === 'RL') {
          newNode.position.x = -newNode.position.x;
        }
      }
      
      layoutedNodes.push(newNode);
    }
  }
  
  // Cache the result
  positionCache.set(cacheKey, layoutedNodes);
  
  // Prevent memory leaks by limiting cache size
  if (positionCache.size > 100) {
    const firstKey = positionCache.keys().next().value;
    positionCache.delete(firstKey);
  }
  
  return layoutedNodes;
}

// Optimized person-to-tree conversion with memoization
const treeCache = new Map<string, FamilyTreeData>();

export function createFamilyTreeFromPersons(
  persons: Person[],
  rootPersonId: string
): FamilyTreeData {
  if (persons.length === 0) {
    return { nodes: [], edges: [] };
  }
  
  // Create cache key
  const cacheKey = `${persons.map(p => p.id).sort().join(',')}-${rootPersonId}`;
  const cached = treeCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Pre-allocate arrays for better performance
  const nodes: FamilyTreeNode[] = new Array(persons.length);
  
  // Optimized node creation
  for (let i = 0; i < persons.length; i++) {
    const person = persons[i];
    nodes[i] = {
      id: person.id,
      type: 'person',
      position: { x: i * 250, y: 0 }, // Default positioning
      data: {
        person,
        isRoot: person.id === rootPersonId,
        generation: person.id === rootPersonId ? 0 : 1 // Simple generation assignment
      }
    };
  }
  
  // For now, create no edges (will be enhanced based on relationships)
  const edges: FamilyTreeEdge[] = [];
  
  const result = { nodes, edges };
  
  // Cache the result
  treeCache.set(cacheKey, result);
  
  // Prevent memory leaks
  if (treeCache.size > 50) {
    const firstKey = treeCache.keys().next().value;
    treeCache.delete(firstKey);
  }
  
  return result;
}

// Optimized validation with early returns and Set operations
const VALID_RELATION_TYPES = new Set(['parent-child', 'spouse', 'sibling']);

export function validateFamilyTreeData(data: FamilyTreeData): void {
  const { nodes, edges } = data;
  
  // Early return for empty data
  if (nodes.length === 0 && edges.length === 0) return;
  
  // Validate nodes (optimized with for-of loop)
  for (const node of nodes) {
    if (!node.id || !node.type || !node.position || !node.data) {
      throw new Error(`Invalid node structure: ${JSON.stringify(node)}`);
    }
    
    const { position } = node;
    if (typeof position.x !== 'number' || typeof position.y !== 'number') {
      throw new Error(`Invalid node position: ${JSON.stringify(position)}`);
    }
    
    if (!node.data.person) {
      throw new Error(`Node missing person data: ${node.id}`);
    }
  }
  
  // Early return if no edges to validate
  if (edges.length === 0) return;
  
  // Create a Set of node IDs for O(1) lookup performance
  const nodeIds = new Set<string>();
  for (const node of nodes) {
    nodeIds.add(node.id);
  }
  
  // Validate edges (optimized with for-of loop)
  for (const edge of edges) {
    if (!edge.id || !edge.source || !edge.target || !edge.type || !edge.data) {
      throw new Error(`Invalid edge structure: ${JSON.stringify(edge)}`);
    }
    
    if (!nodeIds.has(edge.source)) {
      throw new Error(`Edge references non-existent node: ${edge.source}`);
    }
    
    if (!nodeIds.has(edge.target)) {
      throw new Error(`Edge references non-existent node: ${edge.target}`);
    }
    
    if (!VALID_RELATION_TYPES.has(edge.data.relationType)) {
      throw new Error(`Invalid relation type: ${edge.data.relationType}`);
    }
  }
}