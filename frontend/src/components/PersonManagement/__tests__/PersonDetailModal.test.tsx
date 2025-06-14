import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { PersonDetailModal } from '../PersonDetailModal';
import { Person } from '../../../types/person';

describe('PersonDetailModal', () => {
  const mockPerson: Person = {
    id: '1',
    firstName: '太郎',
    lastName: '山田',
    birthDate: '1990-01-01',
    gender: 'male',
    profileImage: 'https://example.com/image.jpg',
    bio: 'これはテスト用のプロフィールです。'
  };

  const mockOnClose = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render person details when open', () => {
    render(
      <PersonDetailModal
        isOpen={true}
        person={mockPerson}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByRole('dialog', { name: '山田 太郎' })).toBeInTheDocument();
    expect(screen.getByText('1990年1月1日')).toBeInTheDocument();
    expect(screen.getByText('男性')).toBeInTheDocument();
    expect(screen.getByText('これはテスト用のプロフィールです。')).toBeInTheDocument();
    expect(screen.getByAltText('山田 太郎')).toHaveAttribute('src', mockPerson.profileImage);
  });

  it('should not render when closed', () => {
    render(
      <PersonDetailModal
        isOpen={false}
        person={mockPerson}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByText('山田 太郎')).not.toBeInTheDocument();
  });

  it('should handle edit button click', () => {
    render(
      <PersonDetailModal
        isOpen={true}
        person={mockPerson}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('編集'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockPerson);
  });

  it('should handle delete button click with confirmation', () => {
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(
      <PersonDetailModal
        isOpen={true}
        person={mockPerson}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('削除'));
    expect(confirmSpy).toHaveBeenCalledWith('この人物を削除しますか？');
    expect(mockOnDelete).toHaveBeenCalledWith(mockPerson);
    
    confirmSpy.mockRestore();
  });

  it('should not delete when confirmation is canceled', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    
    render(
      <PersonDetailModal
        isOpen={true}
        person={mockPerson}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('削除'));
    expect(mockOnDelete).not.toHaveBeenCalled();
    
    confirmSpy.mockRestore();
  });

  it('should display default values when person data is incomplete', () => {
    const incompletePerson: Person = {
      id: '2',
      firstName: '花子',
      lastName: '鈴木'
    };

    render(
      <PersonDetailModal
        isOpen={true}
        person={incompletePerson}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByRole('dialog', { name: '鈴木 花子' })).toBeInTheDocument();
    expect(screen.getAllByText('未設定')).toHaveLength(2); // For birth date and gender
    expect(screen.queryByText('これはテスト用のプロフィールです。')).not.toBeInTheDocument();
  });

  it('should close modal when close button is clicked', () => {
    render(
      <PersonDetailModal
        isOpen={true}
        person={mockPerson}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByLabelText('モーダルを閉じる'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});