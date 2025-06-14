import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { FamilyTreeNode } from '../FamilyTreeNode';
import { Person } from '../../../types/person';

describe('FamilyTreeNode', () => {
  const mockPerson: Person = {
    id: '1',
    firstName: '太郎',
    lastName: '山田',
    birthDate: '1990-01-01',
    gender: 'male',
    profileImage: 'https://example.com/image.jpg'
  };

  const mockNodeData = {
    person: mockPerson,
    isRoot: true,
    generation: 0
  };

  const mockOnPersonClick = vi.fn();
  const mockOnPersonEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render person information in node', () => {
    render(
      <FamilyTreeNode
        data={mockNodeData}
        onPersonClick={mockOnPersonClick}
        onPersonEdit={mockOnPersonEdit}
      />
    );

    expect(screen.getByText('山田 太郎')).toBeInTheDocument();
    expect(screen.getByText('1990年1月1日')).toBeInTheDocument();
    expect(screen.getByAltText('山田 太郎')).toHaveAttribute('src', mockPerson.profileImage);
  });

  it('should show root indicator when isRoot is true', () => {
    render(
      <FamilyTreeNode
        data={mockNodeData}
        onPersonClick={mockOnPersonClick}
        onPersonEdit={mockOnPersonEdit}
      />
    );

    expect(screen.getByText('ルート')).toBeInTheDocument();
  });

  it('should not show root indicator when isRoot is false', () => {
    const nonRootData = { ...mockNodeData, isRoot: false };
    
    render(
      <FamilyTreeNode
        data={nonRootData}
        onPersonClick={mockOnPersonClick}
        onPersonEdit={mockOnPersonEdit}
      />
    );

    expect(screen.queryByText('ルート')).not.toBeInTheDocument();
  });

  it('should call onPersonClick when node is clicked', () => {
    render(
      <FamilyTreeNode
        data={mockNodeData}
        onPersonClick={mockOnPersonClick}
        onPersonEdit={mockOnPersonEdit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /山田 太郎/ }));
    expect(mockOnPersonClick).toHaveBeenCalledWith(mockPerson);
  });

  it('should call onPersonEdit when edit button is clicked', () => {
    render(
      <FamilyTreeNode
        data={mockNodeData}
        onPersonClick={mockOnPersonClick}
        onPersonEdit={mockOnPersonEdit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '編集' }));
    expect(mockOnPersonEdit).toHaveBeenCalledWith(mockPerson);
  });

  it('should render default image when profileImage is not provided', () => {
    const personWithoutImage = { ...mockPerson, profileImage: undefined };
    const dataWithoutImage = { ...mockNodeData, person: personWithoutImage };
    
    render(
      <FamilyTreeNode
        data={dataWithoutImage}
        onPersonClick={mockOnPersonClick}
        onPersonEdit={mockOnPersonEdit}
      />
    );

    expect(screen.getByText('画像なし')).toBeInTheDocument();
  });

  it('should apply generation-based styling', () => {
    const generationData = { ...mockNodeData, generation: 2 };
    
    render(
      <FamilyTreeNode
        data={generationData}
        onPersonClick={mockOnPersonClick}
        onPersonEdit={mockOnPersonEdit}
      />
    );

    const nodeContainer = document.querySelector('[data-generation="2"]');
    expect(nodeContainer).toBeInTheDocument();
  });

  it('should be accessible with proper ARIA labels', () => {
    render(
      <FamilyTreeNode
        data={mockNodeData}
        onPersonClick={mockOnPersonClick}
        onPersonEdit={mockOnPersonEdit}
      />
    );

    expect(screen.getByRole('button', { name: /山田 太郎/ })).toHaveAttribute('aria-label');
    expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument();
  });
});