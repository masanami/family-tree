import React, { Suspense } from 'react';
import type { FamilyTreeData, FamilyTreeLayoutOptions } from '../../types/family-tree';
import type { Person } from '../../types/person';

// Lazy load the heavy FamilyTreeVisualization component
const FamilyTreeVisualization = React.lazy(() => 
  import('./FamilyTreeVisualization').then(module => ({
    default: module.FamilyTreeVisualization
  }))
);

interface FamilyTreeVisualizationLazyProps {
  familyTreeData: FamilyTreeData;
  onPersonClick: (person: Person) => void;
  onPersonEdit: (person: Person) => void;
  onLayoutChange: (layoutOptions: FamilyTreeLayoutOptions) => void;
}

// Loading component for Suspense fallback
const FamilyTreeLoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-50" role="status" aria-live="polite">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">家系図を読み込み中...</p>
      <p className="text-gray-500 text-sm mt-2">
        初回読み込み時は少々お時間をいただく場合があります
      </p>
    </div>
  </div>
);

// Error boundary for lazy loading errors
interface FamilyTreeErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class FamilyTreeErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  FamilyTreeErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): FamilyTreeErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('FamilyTreeVisualization lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-red-50" role="alert">
          <div className="text-center p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-red-800 text-xl font-semibold mb-2">
              家系図の読み込みに失敗しました
            </h2>
            <p className="text-red-600 mb-4">
              {this.state.error?.message || 'コンポーネントの読み込み中にエラーが発生しました'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main lazy wrapper component
export const FamilyTreeVisualizationLazy: React.FC<FamilyTreeVisualizationLazyProps> = (props) => {
  return (
    <FamilyTreeErrorBoundary>
      <Suspense fallback={<FamilyTreeLoadingFallback />}>
        <FamilyTreeVisualization {...props} />
      </Suspense>
    </FamilyTreeErrorBoundary>
  );
};

FamilyTreeVisualizationLazy.displayName = 'FamilyTreeVisualizationLazy';