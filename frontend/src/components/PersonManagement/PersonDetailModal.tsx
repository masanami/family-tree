import React from 'react';
import { Person } from '../../types/person';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';

interface PersonDetailModalProps {
  isOpen: boolean;
  person?: Person;
  onClose: () => void;
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
}

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  isOpen,
  person,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!person) return null;

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

  const handleDelete = () => {
    if (window.confirm('この人物を削除しますか？')) {
      onDelete(person);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${person.lastName} ${person.firstName}`} size="lg">
      <div className="space-y-6">
        {/* Profile Image */}
        <div className="flex justify-center">
          {person.profileImage ? (
            <img
              src={person.profileImage}
              alt={`${person.lastName} ${person.firstName}`}
              className="w-32 h-32 rounded-full object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">画像なし</span>
            </div>
          )}
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700">氏名</h3>
            <p className="mt-1 text-lg text-gray-900">{person.lastName} {person.firstName}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700">生年月日</h3>
            <p className="mt-1 text-lg text-gray-900">{formatDate(person.birthDate)}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700">性別</h3>
            <p className="mt-1 text-lg text-gray-900">{getGenderLabel(person.gender)}</p>
          </div>
        </div>

        {/* Bio */}
        {person.bio && (
          <div>
            <h3 className="text-sm font-medium text-gray-700">自己紹介</h3>
            <p className="mt-1 text-gray-900 whitespace-pre-wrap">{person.bio}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            variant="danger"
            onClick={handleDelete}
          >
            削除
          </Button>
          <Button
            variant="primary"
            onClick={() => onEdit(person)}
          >
            編集
          </Button>
        </div>
      </div>
    </Modal>
  );
};