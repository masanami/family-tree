import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { PersonForm } from '../PersonForm';
import { Person } from '../../../types/person';

describe('PersonForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(<PersonForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/名前/)).toBeInTheDocument();
    expect(screen.getByLabelText(/苗字/)).toBeInTheDocument();
    expect(screen.getByLabelText('生年月日')).toBeInTheDocument();
    expect(screen.getByLabelText('性別')).toBeInTheDocument();
    expect(screen.getByLabelText('プロフィール画像URL')).toBeInTheDocument();
    expect(screen.getByText('追加')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
  });

  it('should handle form submission with valid data', async () => {
    const user = userEvent.setup();
    render(<PersonForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.type(screen.getByLabelText(/名前/), '太郎');
    await user.type(screen.getByLabelText(/苗字/), '山田');
    await user.type(screen.getByLabelText('生年月日'), '1990-01-01');
    await user.selectOptions(screen.getByLabelText('性別'), 'male');

    await user.click(screen.getByText('追加'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        firstName: '太郎',
        lastName: '山田',
        birthDate: '1990-01-01',
        gender: 'male',
        profileImage: undefined
      });
    });
  });

  it('should show validation errors for required fields', async () => {
    const user = userEvent.setup();
    render(<PersonForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.click(screen.getByText('追加'));

    await waitFor(() => {
      expect(screen.getByText('名前は必須項目です')).toBeInTheDocument();
      expect(screen.getByText('苗字は必須項目です')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should populate form when editing existing person', () => {
    const existingPerson: Person = {
      id: '1',
      firstName: '花子',
      lastName: '鈴木',
      birthDate: '1985-05-15',
      gender: 'female',
      profileImage: 'https://example.com/image.jpg'
    };

    render(
      <PersonForm 
        person={existingPerson}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('花子')).toBeInTheDocument();
    expect(screen.getByDisplayValue('鈴木')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1985-05-15')).toBeInTheDocument();
    const genderSelect = screen.getByLabelText('性別');
    expect(genderSelect).toHaveValue('female');
  });

  it('should handle cancel button click', async () => {
    const user = userEvent.setup();
    render(<PersonForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.click(screen.getByText('キャンセル'));

    expect(mockOnCancel).toHaveBeenCalled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should handle profile image URL input', async () => {
    const user = userEvent.setup();
    render(<PersonForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const imageUrl = 'https://example.com/image.jpg';
    await user.type(screen.getByLabelText('プロフィール画像URL'), imageUrl);

    expect(screen.getByDisplayValue(imageUrl)).toBeInTheDocument();
  });
});