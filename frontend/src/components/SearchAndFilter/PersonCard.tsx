import React, { memo } from 'react';
import type { PersonSearchResult } from '../../types/search';

interface PersonCardProps {
  person: PersonSearchResult;
  onClick: (person: PersonSearchResult) => void;
  highlightedText?: React.ReactNode;
  showRelevanceScore?: boolean;
  showMatchedFields?: boolean;
  cardSize?: number;
}

export const PersonCard = memo<PersonCardProps>(({
  person,
  onClick,
  highlightedText,
  showRelevanceScore = false,
  showMatchedFields = false,
  cardSize,
}) => {
  const handleClick = () => {
    onClick(person);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(person);
    }
  };

  const getGenderLabel = (gender?: string) => {
    switch (gender) {
      case 'male': return '男性';
      case 'female': return '女性';
      case 'other': return 'その他';
      default: return '';
    }
  };

  const getMatchedFieldsLabel = (fields: string[]) => {
    return fields.map(field => {
      switch (field) {
        case 'firstName': return '名前';
        case 'lastName': return '苗字';
        case 'birthDate': return '生年月日';
        default: return field;
      }
    }).join(', ');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200 bg-white transform hover:scale-[1.02]"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="listitem"
      data-testid={`person-card-${person.id}`}
      style={cardSize ? { width: `${cardSize}px` } : undefined}
      aria-label={`${person.fullName}の詳細を表示`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <img
            src={person.profileImage || '/default-avatar.png'}
            alt={person.fullName}
            className="w-12 h-12 rounded-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">
            {highlightedText || person.fullName}
          </h3>
          <div className="text-sm text-gray-600 space-y-1 mt-1">
            {person.birthDate && (
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(person.birthDate)}生まれ</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {person.age}歳
              </span>
              {person.gender && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {getGenderLabel(person.gender)}
                </span>
              )}
            </div>
            {!person.isAlive && (
              <div className="flex items-center space-x-1 text-red-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">故人</span>
                {person.deathDate && (
                  <span className="text-sm">- {formatDate(person.deathDate)}逝去</span>
                )}
              </div>
            )}
          </div>
          {showRelevanceScore && (
            <div className="text-xs text-blue-600 mt-2">
              関連度: {Math.round(person.relevanceScore * 100)}%
            </div>
          )}
          {showMatchedFields && person.matchedFields && person.matchedFields.length > 0 && (
            <div className="text-xs text-green-600 mt-1">
              マッチ: {getMatchedFieldsLabel(person.matchedFields)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

PersonCard.displayName = 'PersonCard';