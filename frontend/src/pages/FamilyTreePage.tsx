import React from 'react';
import { FamilyTreeVisualizationLazy } from '../components/FamilyTree/FamilyTreeVisualizationLazy';
import type { FamilyTreeData, FamilyTreeLayoutOptions } from '../types/family-tree';
import type { Person } from '../types/person';

interface FamilyTreePageProps {
  familyTreeData: FamilyTreeData;
  onPersonClick: (person: Person) => void;
  onPersonEdit: (person: Person) => void;
  onLayoutChange: (layoutOptions: FamilyTreeLayoutOptions) => void;
}

export const FamilyTreePage: React.FC<FamilyTreePageProps> = ({
  familyTreeData,
  onPersonClick,
  onPersonEdit,
  onLayoutChange
}) => {
  return (
    <div className="w-full h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b p-4">
        <h1 className="text-2xl font-bold text-gray-900">家系図ビジュアライゼーション</h1>
        <p className="text-gray-600 mt-1">
          家族の関係性を視覚的に表示・編集できます
        </p>
      </header>
      
      <main className="flex-1 h-full">
        <FamilyTreeVisualizationLazy
          familyTreeData={familyTreeData}
          onPersonClick={onPersonClick}
          onPersonEdit={onPersonEdit}
          onLayoutChange={onLayoutChange}
        />
      </main>
    </div>
  );
};

FamilyTreePage.displayName = 'FamilyTreePage';