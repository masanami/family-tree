import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { FamilyTreeForm } from '../FamilyTreeForm';
import { FamilyTreeList } from '../FamilyTreeList';

// Simple smoke tests to verify components render without crashing
vi.mock('../../../hooks/useFamilyTree', () => ({
  useFamilyTree: () => ({
    familyTrees: [],
    currentFamilyTree: null,
    loading: false,
    error: null,
    hasMore: false,
    page: 1,
    loadFamilyTrees: vi.fn(),
    loadFamilyTree: vi.fn(),
    createFamilyTree: vi.fn(),
    updateFamilyTree: vi.fn(),
    deleteFamilyTree: vi.fn(),
    loadMore: vi.fn(),
    clearError: vi.fn(),
    reset: vi.fn(),
  }),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user1', name: 'Test User', email: 'test@example.com' },
    isAuthenticated: true,
  }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: undefined }),
}));

describe('Family Tree Management Components Integration', () => {
  describe('FamilyTreeForm', () => {
    it('should render create form without crashing', () => {
      render(<FamilyTreeForm />);
      expect(screen.getByText('新しい家系図を作成')).toBeDefined();
    });
  });

  describe('FamilyTreeList', () => {
    it('should render list component without crashing', () => {
      render(<FamilyTreeList />);
      // The component renders in empty state when no family trees exist
      expect(screen.getByText('家系図がありません')).toBeDefined();
    });

    it('should show empty state when no family trees exist', () => {
      render(<FamilyTreeList />);
      expect(screen.getByText('家系図がありません')).toBeDefined();
      expect(screen.getByText('最初の家系図を作成しましょう')).toBeDefined();
    });
  });
});