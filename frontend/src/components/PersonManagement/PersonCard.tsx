import React from 'react';
import { Person } from '../../types/person';
import { Button } from '../UI/Button';

interface PersonCardProps {
  person: Person;
  onView: (person: Person) => void;
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  person,
  onView,
  onEdit,
  onDelete
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '未設定';
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getGenderLabel = (gender?: string) => {
    switch (gender) {
      case 'male': return '男性';
      case 'female': return '女性';
      default: return '未設定';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start space-x-4">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          {person.profileImage ? (
            <img
              src={person.profileImage}
              alt={`${person.lastName} ${person.firstName}`}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">画像なし</span>
            </div>
          )}
        </div>

        {/* Person Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {person.lastName} {person.firstName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {formatDate(person.birthDate)}
          </p>
          <p className="text-sm text-gray-600">
            {getGenderLabel(person.gender)}
          </p>
          {person.bio && (
            <p className="text-sm text-gray-700 mt-2 line-clamp-2">
              {person.bio}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => onView(person)}
          >
            詳細
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onEdit(person)}
          >
            編集
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(person)}
          >
            削除
          </Button>
        </div>
      </div>
    </div>
  );
};