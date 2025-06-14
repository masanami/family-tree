import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Input } from '../Input';

describe('Input', () => {
  it('should render input with label', () => {
    render(<Input label="名前" />);
    expect(screen.getByLabelText('名前')).toBeInTheDocument();
  });

  it('should handle value changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(<Input label="名前" onChange={handleChange} />);
    
    await user.type(screen.getByLabelText('名前'), 'テスト');
    
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          value: 'テスト'
        })
      })
    );
  });

  it('should display error message when error prop is provided', () => {
    render(<Input label="名前" error="この項目は必須です" />);
    expect(screen.getByText('この項目は必須です')).toBeInTheDocument();
  });

  it('should apply error styles when error exists', () => {
    render(<Input label="名前" error="エラー" />);
    const input = screen.getByLabelText('名前');
    expect(input).toHaveClass('border-red-500');
  });

  it('should show required indicator when required', () => {
    render(<Input label="名前" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should render as textarea when type is textarea', () => {
    render(<Input label="説明" type="textarea" />);
    expect(screen.getByRole('textbox')).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('should handle different input types', () => {
    const { rerender } = render(<Input label="日付" type="date" />);
    expect(screen.getByLabelText('日付')).toHaveAttribute('type', 'date');
    
    rerender(<Input label="メール" type="email" />);
    expect(screen.getByLabelText('メール')).toHaveAttribute('type', 'email');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input label="名前" disabled />);
    expect(screen.getByLabelText('名前')).toBeDisabled();
  });
});