import React, { useState } from 'react';
import { RelationshipCreatorLazy, RelationshipListLazy } from '../components/RelationshipManagement/RelationshipManagementLazy';
import type { Person } from '../types/person';
import type { Relationship } from '../types/relationship';

interface RelationshipManagementPageProps {
  persons: Person[];
  relationships: Relationship[];
  onRelationshipCreate: (relationship: Omit<Relationship, 'id'>) => void;
  onRelationshipUpdate: (relationship: Relationship) => void;
  onRelationshipDelete: (relationshipId: string) => void;
  isLoading?: boolean;
}

export const RelationshipManagementPage: React.FC<RelationshipManagementPageProps> = ({
  persons,
  relationships,
  onRelationshipCreate,
  onRelationshipUpdate,
  onRelationshipDelete,
  isLoading = false
}) => {
  const [editingRelationship, setEditingRelationship] = useState<Relationship | null>(null);

  const handleRelationshipEdit = (relationship: Relationship) => {
    setEditingRelationship(relationship);
  };

  const handleRelationshipUpdate = (updatedRelationship: Relationship) => {
    onRelationshipUpdate(updatedRelationship);
    setEditingRelationship(null);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b p-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">関係性管理</h1>
          <p className="text-gray-600 mt-1">
            家族メンバー間の関係性を管理できます
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Relationship Creator Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingRelationship ? '関係性を編集' : '新しい関係性を追加'}
            </h2>
            <RelationshipCreatorLazy
              persons={persons}
              onRelationshipCreate={onRelationshipCreate}
              isLoading={isLoading}
            />
            {editingRelationship && (
              <button
                onClick={() => setEditingRelationship(null)}
                className="mt-4 text-gray-600 hover:text-gray-800 underline"
              >
                編集をキャンセル
              </button>
            )}
          </div>

          {/* Relationship List Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">既存の関係性</h2>
            <RelationshipListLazy
              relationships={relationships}
              persons={persons}
              onRelationshipEdit={handleRelationshipEdit}
              onRelationshipDelete={onRelationshipDelete}
              isLoading={isLoading}
            />
          </div>
        </div>

        {relationships.length === 0 && !isLoading && (
          <div className="text-center py-12 mt-6">
            <div className="text-gray-400 text-6xl mb-4">🔗</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              まだ関係性が登録されていません
            </h3>
            <p className="text-gray-600 mb-4">
              家族メンバー間の関係性を追加して家系図を構築しましょう
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

RelationshipManagementPage.displayName = 'RelationshipManagementPage';