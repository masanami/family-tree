import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('should not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="テストモーダル">
        <p>モーダル内容</p>
      </Modal>
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="テストモーダル">
        <p>モーダル内容</p>
      </Modal>
    );
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('テストモーダル')).toBeInTheDocument();
    expect(screen.getByText('モーダル内容')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    
    render(
      <Modal isOpen={true} onClose={handleClose} title="テストモーダル">
        <p>モーダル内容</p>
      </Modal>
    );
    
    fireEvent.click(screen.getByLabelText('モーダルを閉じる'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay is clicked', () => {
    const handleClose = vi.fn();
    
    render(
      <Modal isOpen={true} onClose={handleClose} title="テストモーダル">
        <p>モーダル内容</p>
      </Modal>
    );
    
    fireEvent.click(screen.getByTestId('modal-overlay'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should not close when modal content is clicked', () => {
    const handleClose = vi.fn();
    
    render(
      <Modal isOpen={true} onClose={handleClose} title="テストモーダル">
        <p>モーダル内容</p>
      </Modal>
    );
    
    fireEvent.click(screen.getByRole('dialog'));
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('should handle escape key press', () => {
    const handleClose = vi.fn();
    
    render(
      <Modal isOpen={true} onClose={handleClose} title="テストモーダル">
        <p>モーダル内容</p>
      </Modal>
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should apply custom size classes', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="テストモーダル" size="lg">
        <p>モーダル内容</p>
      </Modal>
    );
    
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveClass('max-w-2xl');
  });
});