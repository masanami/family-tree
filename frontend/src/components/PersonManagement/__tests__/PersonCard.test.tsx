import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { PersonCard } from '../PersonCard';
import { Person } from '../../../types/person';

describe('PersonCard', () => {
  const mockPerson: Person = {
    id: '1',
    firstName: '太郎',
    lastName: '山田',
    birthDate: '1990-01-01',
    gender: 'male',
    profileImage: 'https://example.com/image.jpg'
  };

  const mockOnView = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display person information', () => {
    render(
      <PersonCard
        person={mockPerson}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('山田 太郎')).toBeInTheDocument();
    expect(screen.getByText('1990年1月1日')).toBeInTheDocument();
    expect(screen.getByAltText('山田 太郎')).toHaveAttribute('src', mockPerson.profileImage);
  });

  it('should display default image when no profile image', () => {
    const personWithoutImage = { ...mockPerson, profileImage: undefined };
    
    render(
      <PersonCard
        person={personWithoutImage}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('画像なし')).toBeInTheDocument();
  });

  it('should call onView when detail button is clicked', () => {
    render(
      <PersonCard
        person={mockPerson}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('詳細'));
    expect(mockOnView).toHaveBeenCalledWith(mockPerson);
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <PersonCard
        person={mockPerson}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('編集'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockPerson);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <PersonCard
        person={mockPerson}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('削除'));
    expect(mockOnDelete).toHaveBeenCalledWith(mockPerson);
  });

  it('should format birth date correctly for different genders', () => {
    const femalePerson = { ...mockPerson, gender: 'female' as const };
    
    const { rerender } = render(
      <PersonCard
        person={mockPerson}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('1990年1月1日')).toBeInTheDocument();

    rerender(
      <PersonCard
        person={femalePerson}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('1990年1月1日')).toBeInTheDocument();
  });
});