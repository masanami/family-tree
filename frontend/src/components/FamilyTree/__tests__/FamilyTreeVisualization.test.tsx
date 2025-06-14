import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { FamilyTreeVisualization } from '../FamilyTreeVisualization';
import { Person } from '../../../types/person';
import { FamilyTreeData } from '../../../types/family-tree';

// React Flow のモック
vi.mock('reactflow', () => ({
  ReactFlow: ({ children, nodes, edges, onNodesChange, onEdgesChange, tabIndex, ...props }: any) => (
    <div data-testid="react-flow" tabIndex={tabIndex} {...props}>
      <div data-testid="nodes">{JSON.stringify(nodes)}</div>
      <div data-testid="edges">{JSON.stringify(edges)}</div>
      {children}
    </div>
  ),
  Controls: () => <div data-testid="flow-controls">Controls</div>,
  MiniMap: () => <div data-testid="flow-minimap">MiniMap</div>,
  Background: () => <div data-testid="flow-background">Background</div>,
  useNodesState: (initialNodes: any) => [initialNodes, vi.fn()],
  useEdgesState: (initialEdges: any) => [initialEdges, vi.fn()],
  addEdge: vi.fn(),
  useReactFlow: () => ({
    fitView: vi.fn(),
    getZoom: vi.fn(() => 1),
    setZoom: vi.fn()
  })
}));

describe('FamilyTreeVisualization', () => {
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

  const mockFamilyTreeData: FamilyTreeData = {
    nodes: [
      {
        id: '1',
        type: 'person',
        position: { x: 100, y: 100 },
        data: { person: mockPersons[0], isRoot: true, generation: 0 }
      },
      {
        id: '2',
        type: 'person',
        position: { x: 300, y: 100 },
        data: { person: mockPersons[1], generation: 0 }
      },
      {
        id: '3',
        type: 'person',
        position: { x: 200, y: 250 },
        data: { person: mockPersons[2], generation: 1 }
      }
    ],
    edges: [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'family-relation',
        data: { relationType: 'spouse', label: '配偶者' }
      },
      {
        id: 'e1-3',
        source: '1',
        target: '3',
        type: 'family-relation',
        data: { relationType: 'parent-child', label: '親子' }
      }
    ]
  };

  const mockOnPersonClick = vi.fn();
  const mockOnPersonEdit = vi.fn();
  const mockOnLayoutChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render family tree with React Flow', () => {
    render(
      <FamilyTreeVisualization
        familyTreeData={mockFamilyTreeData}
        onPersonClick={mockOnPersonClick}
        onPersonEdit={mockOnPersonEdit}
        onLayoutChange={mockOnLayoutChange}
      />
    );

    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    expect(screen.getByTestId('flow-controls')).toBeInTheDocument();
    expect(screen.getByTestId('flow-minimap')).toBeInTheDocument();
    expect(screen.getByTestId('flow-background')).toBeInTheDocument();
  });

  it('should display all nodes and edges', () => {
    render(
      <FamilyTreeVisualization
        familyTreeData={mockFamilyTreeData}
        onPersonClick={mockOnPersonClick}
        onPersonEdit={mockOnPersonEdit}
        onLayoutChange={mockOnLayoutChange}
      />
    );

    const nodesData = screen.getByTestId('nodes');
    const edgesData = screen.getByTestId('edges');

    expect(nodesData).toHaveTextContent('3'); // 3 nodes
    expect(edgesData).toHaveTextContent('2'); // 2 edges
  });

  it('should provide layout controls', () => {
    render(
      <FamilyTreeVisualization
        familyTreeData={mockFamilyTreeData}
        onPersonClick={mockOnPersonClick}
        onPersonEdit={mockOnPersonEdit}
        onLayoutChange={mockOnLayoutChange}
      />
    );

    expect(screen.getByText('レイアウト変更')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '上から下' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '左から右' })).toBeInTheDocument();
  });

  it('should handle layout change', async () => {
    render(
      <FamilyTreeVisualization
        familyTreeData={mockFamilyTreeData}
        onPersonClick={mockOnPersonClick}
        onPersonEdit={mockOnPersonEdit}
        onLayoutChange={mockOnLayoutChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '左から右' }));

    await waitFor(() => {
      expect(mockOnLayoutChange).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'LR'
        })
      );
    });
  });

  it('should provide zoom controls', () => {
    render(
      <FamilyTreeVisualization
        familyTreeData={mockFamilyTreeData}
        onPersonClick={mockOnPersonClick}
        onPersonEdit={mockOnPersonEdit}
        onLayoutChange={mockOnLayoutChange}
      />
    );

    expect(screen.getByRole('button', { name: /ズームイン/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ズームアウト/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /全体表示/ })).toBeInTheDocument();
  });

  it('should handle empty family tree data', () => {
    const emptyData: FamilyTreeData = { nodes: [], edges: [] };

    render(
      <FamilyTreeVisualization
        familyTreeData={emptyData}
        onPersonClick={mockOnPersonClick}
        onPersonEdit={mockOnPersonEdit}
        onLayoutChange={mockOnLayoutChange}
      />
    );

    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    expect(screen.getByText('家系図データがありません')).toBeInTheDocument();
  });

  it('should be responsive and handle window resize', () => {
    render(
      <FamilyTreeVisualization
        familyTreeData={mockFamilyTreeData}
        onPersonClick={mockOnPersonClick}
        onPersonEdit={mockOnPersonEdit}
        onLayoutChange={mockOnLayoutChange}
      />
    );

    const container = screen.getByTestId('react-flow').parentElement;
    expect(container).toHaveClass('w-full', 'h-full');
  });

  it('should support keyboard navigation', () => {
    render(
      <FamilyTreeVisualization
        familyTreeData={mockFamilyTreeData}
        onPersonClick={mockOnPersonClick}
        onPersonEdit={mockOnPersonEdit}
        onLayoutChange={mockOnLayoutChange}
      />
    );

    const flowContainer = screen.getByTestId('react-flow');
    expect(flowContainer).toHaveAttribute('tabIndex', '0');
  });
});