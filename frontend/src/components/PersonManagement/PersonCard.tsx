import React, { useCallback, useMemo } from 'react';
import { Person } from '../../types/person';
import { Button } from '../UI/Button';

interface PersonCardProps {
  person: Person;
  onView: (person: Person) => void;
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '未設定';
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

const getGenderLabel = (gender?: string): string => {
  switch (gender) {
    case 'male': return '男性';
    case 'female': return '女性';
    default: return '未設定';
  }
};

export const PersonCard = React.memo<PersonCardProps>(({
  person,
  onView,
  onEdit,
  onDelete
}) => {
  const handleView = useCallback(() => onView(person), [onView, person]);
  const handleEdit = useCallback(() => onEdit(person), [onEdit, person]);
  const handleDelete = useCallback(() => onDelete(person), [onDelete, person]);

  const fullName = useMemo(() => 
    `${person.lastName} ${person.firstName}`, 
    [person.lastName, person.firstName]
  );

  const formattedDate = useMemo(() => 
    formatDate(person.birthDate), 
    [person.birthDate]
  );

  const genderLabel = useMemo(() => 
    getGenderLabel(person.gender), 
    [person.gender]
  );

  return (
    <article 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
      aria-labelledby={`person-${person.id}-name`}
    >
      <div className="flex items-start space-x-4">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          {person.profileImage ? (
            <img
              src={person.profileImage}
              alt={fullName}
              className="w-16 h-16 rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <div 
              className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center"
              role="img"
              aria-label="プロフィール画像なし"
            >
              <span className="text-gray-500 text-sm" aria-hidden="true">画像なし</span>
            </div>
          )}
        </div>

        {/* Person Info */}
        <div className="flex-1 min-w-0">
          <h3 
            id={`person-${person.id}-name`}
            className="text-lg font-semibold text-gray-900 truncate"
          >
            {fullName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            <span className="sr-only">生年月日: </span>
            {formattedDate}
          </p>
          <p className="text-sm text-gray-600">
            <span className="sr-only">性別: </span>
            {genderLabel}
          </p>
          {person.bio && (
            <p className="text-sm text-gray-700 mt-2 line-clamp-2">
              <span className="sr-only">自己紹介: </span>
              {person.bio}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2" role="group" aria-label="人物操作">
          <Button
            size="sm"
            variant="primary"
            onClick={handleView}
            aria-label={`${fullName}の詳細を表示`}
          >
            詳細
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleEdit}
            aria-label={`${fullName}を編集`}
          >
            編集
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={handleDelete}
            aria-label={`${fullName}を削除`}
          >
            削除
          </Button>
        </div>
      </div>
    </article>
  );
});

PersonCard.displayName = 'PersonCard';