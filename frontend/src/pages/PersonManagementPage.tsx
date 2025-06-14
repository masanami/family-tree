import React, { useState } from 'react';
import { PersonFormLazy, PersonCardLazy, PersonDetailModalLazy } from '../components/PersonManagement/PersonManagementLazy';
import type { Person } from '../types/person';

interface PersonManagementPageProps {
  persons: Person[];
  onPersonCreate: (personData: Partial<Person>) => void;
  onPersonUpdate: (person: Person) => void;
  onPersonDelete: (person: Person) => void;
  isLoading?: boolean;
}

export const PersonManagementPage: React.FC<PersonManagementPageProps> = ({
  persons,
  onPersonCreate,
  onPersonUpdate,
  onPersonDelete,
  isLoading = false
}) => {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | undefined>(undefined);

  const handlePersonClick = (person: Person) => {
    setSelectedPerson(person);
    setIsDetailModalOpen(true);
  };

  const handlePersonEdit = (person: Person) => {
    setEditingPerson(person);
    setIsFormVisible(true);
  };

  const handleFormSubmit = (personData: Partial<Person>) => {
    if (editingPerson) {
      onPersonUpdate({ ...editingPerson, ...personData });
    } else {
      onPersonCreate(personData);
    }
    setIsFormVisible(false);
    setEditingPerson(undefined);
  };

  const handleFormCancel = () => {
    setIsFormVisible(false);
    setEditingPerson(undefined);
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedPerson(null);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">人物管理</h1>
            <p className="text-gray-600 mt-1">
              家族メンバーの情報を管理できます
            </p>
          </div>
          <button
            onClick={() => setIsFormVisible(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            新しい人物を追加
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {isFormVisible && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingPerson ? '人物情報を編集' : '新しい人物を追加'}
            </h2>
            <PersonFormLazy
              person={editingPerson}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isLoading={isLoading}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {persons.map((person) => (
            <PersonCardLazy
              key={person.id}
              person={person}
              onClick={handlePersonClick}
              onEdit={handlePersonEdit}
              onDelete={onPersonDelete}
            />
          ))}
        </div>

        {persons.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              まだ人物が登録されていません
            </h3>
            <p className="text-gray-600 mb-4">
              最初の家族メンバーを追加して始めましょう
            </p>
            <button
              onClick={() => setIsFormVisible(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              人物を追加
            </button>
          </div>
        )}
      </main>

      <PersonDetailModalLazy
        person={selectedPerson}
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
        onEdit={handlePersonEdit}
        onDelete={onPersonDelete}
      />
    </div>
  );
};

PersonManagementPage.displayName = 'PersonManagementPage';