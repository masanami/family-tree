import React, { useCallback, useMemo } from 'react';
import { Person } from '../../types/person';

interface FamilyTreeNodeProps {
  data: {
    person: Person;
    isRoot?: boolean;
    generation?: number;
  };
  onPersonClick: (person: Person) => void;
  onPersonEdit: (person: Person) => void;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '未設定';
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

// Memoized sub-components for performance
const ConnectionPoints = React.memo(() => (
  <>
    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full" />
    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full" />
    <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full" />
    <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full" />
  </>
));
ConnectionPoints.displayName = 'ConnectionPoints';

interface ProfileImageProps {
  src?: string;
  alt: string;
}

const ProfileImage = React.memo<ProfileImageProps>(({ src, alt }) => (
  <div className="flex-shrink-0">
    {src ? (
      <img
        src={src}
        alt={alt}
        className="w-12 h-12 rounded-full object-cover"
        loading="lazy"
      />
    ) : (
      <div 
        className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center"
        role="img"
        aria-label="プロフィール画像なし"
      >
        <span className="text-gray-500 text-xs" aria-hidden="true">画像なし</span>
      </div>
    )}
  </div>
));
ProfileImage.displayName = 'ProfileImage';

export const FamilyTreeNode = React.memo<FamilyTreeNodeProps>(({
  data,
  onPersonClick,
  onPersonEdit
}) => {
  const { person, isRoot, generation } = data;

  const handlePersonClick = useCallback(() => {
    onPersonClick(person);
  }, [onPersonClick, person]);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPersonEdit(person);
  }, [onPersonEdit, person]);

  const fullName = useMemo(() => 
    `${person.lastName} ${person.firstName}`, 
    [person.lastName, person.firstName]
  );

  const formattedDate = useMemo(() => 
    formatDate(person.birthDate), 
    [person.birthDate]
  );

  const nodeClasses = useMemo(() => 
    "bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 min-w-[200px] relative cursor-pointer",
    []
  );

  const editButtonClasses = useMemo(() => 
    "absolute -top-1 -left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full hover:bg-blue-600 transition-colors",
    []
  );

  const profileButtonClasses = useMemo(() => 
    "w-full text-left",
    []
  );

  return (
    <div className="family-tree-node relative">
      {/* Connection Points (simplified for testing) */}
      <ConnectionPoints />

      {/* Node Content */}
      <div
        className={nodeClasses}
        data-generation={generation}
      >
        {/* Root Indicator */}
        {isRoot && (
          <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
            ルート
          </div>
        )}

        {/* Edit Button */}
        <button
          onClick={handleEditClick}
          className={editButtonClasses}
          aria-label="編集"
        >
          編集
        </button>

        {/* Clickable Profile Section */}
        <button
          onClick={handlePersonClick}
          className={profileButtonClasses}
          aria-label={`${fullName}の詳細を表示`}
        >
          <div className="flex items-center space-x-3">
            {/* Profile Image */}
            <ProfileImage src={person.profileImage} alt={fullName} />

            {/* Person Info */}
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {fullName}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {formattedDate}
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
});

FamilyTreeNode.displayName = 'FamilyTreeNode';