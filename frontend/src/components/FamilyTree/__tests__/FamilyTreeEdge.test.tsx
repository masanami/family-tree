import { render, screen } from '@testing-library/react';
import { FamilyTreeEdge } from '../FamilyTreeEdge';

describe('FamilyTreeEdge', () => {
  const baseProps = {
    id: 'edge-1',
    sourceX: 100,
    sourceY: 100,
    targetX: 200,
    targetY: 200,
    style: {}
  };

  it('should render parent-child relationship edge', () => {
    const edgeData = {
      relationType: 'parent-child' as const,
      label: '親子'
    };

    render(
      <svg>
        <FamilyTreeEdge
          {...baseProps}
          data={edgeData}
        />
      </svg>
    );

    expect(screen.getByText('親子')).toBeInTheDocument();
  });

  it('should render spouse relationship edge', () => {
    const edgeData = {
      relationType: 'spouse' as const,
      label: '配偶者'
    };

    render(
      <svg>
        <FamilyTreeEdge
          {...baseProps}
          data={edgeData}
        />
      </svg>
    );

    expect(screen.getByText('配偶者')).toBeInTheDocument();
  });

  it('should render sibling relationship edge', () => {
    const edgeData = {
      relationType: 'sibling' as const,
      label: '兄弟姉妹'
    };

    render(
      <svg>
        <FamilyTreeEdge
          {...baseProps}
          data={edgeData}
        />
      </svg>
    );

    expect(screen.getByText('兄弟姉妹')).toBeInTheDocument();
  });

  it('should apply different styles based on relation type', () => {
    const parentChildData = {
      relationType: 'parent-child' as const
    };

    const { rerender } = render(
      <svg>
        <FamilyTreeEdge
          {...baseProps}
          data={parentChildData}
        />
      </svg>
    );

    const parentChildPath = screen.getByRole('presentation');
    expect(parentChildPath).toHaveClass('family-edge-parent-child');

    const spouseData = {
      relationType: 'spouse' as const
    };

    rerender(
      <svg>
        <FamilyTreeEdge
          {...baseProps}
          data={spouseData}
        />
      </svg>
    );

    const spousePath = screen.getByRole('presentation');
    expect(spousePath).toHaveClass('family-edge-spouse');
  });

  it('should render without label when label is not provided', () => {
    const edgeData = {
      relationType: 'parent-child' as const
    };

    render(
      <svg>
        <FamilyTreeEdge
          {...baseProps}
          data={edgeData}
        />
      </svg>
    );

    expect(screen.queryByText(/親子|配偶者|兄弟姉妹/)).not.toBeInTheDocument();
  });

  it('should create proper path from source to target', () => {
    const edgeData = {
      relationType: 'parent-child' as const
    };

    render(
      <svg>
        <FamilyTreeEdge
          {...baseProps}
          sourceX={50}
          sourceY={50}
          targetX={150}
          targetY={150}
          data={edgeData}
        />
      </svg>
    );

    const path = screen.getByRole('presentation');
    expect(path).toHaveAttribute('d');
    const pathData = path.getAttribute('d');
    expect(pathData).toContain('M50,50'); // Start point
    expect(pathData).toContain('150,150'); // End point
  });

  it('should be accessible with proper ARIA attributes', () => {
    const edgeData = {
      relationType: 'parent-child' as const,
      label: '親子関係'
    };

    render(
      <svg>
        <FamilyTreeEdge
          {...baseProps}
          data={edgeData}
        />
      </svg>
    );

    const path = screen.getByRole('presentation');
    expect(path).toHaveAttribute('aria-label', '親子関係');
  });
});