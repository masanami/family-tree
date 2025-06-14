import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';
import { Input } from '../UI/Input';
import { useRelationship } from '../../hooks/useRelationship';
import type { Person } from '../../types/person';
import type { Relationship, RelationshipType } from '../../types/relationship';

interface RelationshipListProps {
  persons: Person[];
  familyTreeId: string;
  onEdit: (relationship: Relationship) => void;
  onDelete: (relationship: Relationship) => void;
  showDeleteConfirmation?: boolean;
  allowConfirmationToggle?: boolean;
}

type FilterType = 'all' | RelationshipType;
type ConfirmationFilter = 'all' | 'confirmed' | 'unconfirmed';
type SortOrder = 'newest' | 'oldest' | 'alphabetical';

const RELATIONSHIP_TYPE_LABELS: Record<RelationshipType, string> = {
  spouse: '配偶者',
  parent: '親',
  child: '子',
  sibling: '兄弟・姉妹',
  grandparent: '祖父母',
  grandchild: '孫',
  uncle_aunt: '叔父・叔母',
  nephew_niece: '甥・姪',
  cousin: 'いとこ',
};

export const RelationshipList: React.FC<RelationshipListProps> = ({
  persons,
  familyTreeId,
  onEdit,
  onDelete,
  showDeleteConfirmation = false,
  allowConfirmationToggle = false,
}) => {
  const {
    relationships,
    loading,
    error,
    loadRelationships,
    deleteRelationship,
    updateRelationship,
  } = useRelationship();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [confirmationFilter, setConfirmationFilter] = useState<ConfirmationFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [relationshipToDelete, setRelationshipToDelete] = useState<Relationship | null>(null);

  // Load relationships on mount
  useEffect(() => {
    loadRelationships(familyTreeId);
  }, [familyTreeId, loadRelationships]);

  // Get person name by ID
  const getPersonName = useCallback((personId: string): string => {
    const person = persons.find(p => p.id === personId);
    return person ? `${person.lastName} ${person.firstName}` : '不明';
  }, [persons]);

  // Filter and sort relationships
  const filteredAndSortedRelationships = useMemo(() => {
    let filtered = relationships;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(rel => {
        const fromName = getPersonName(rel.fromPersonId).toLowerCase();
        const toName = getPersonName(rel.toPersonId).toLowerCase();
        return fromName.includes(query) || toName.includes(query);
      });
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(rel => rel.relationshipType === filterType);
    }

    // Confirmation filter
    if (confirmationFilter !== 'all') {
      const isConfirmed = confirmationFilter === 'confirmed';
      filtered = filtered.filter(rel => rel.isConfirmed === isConfirmed);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'alphabetical':
          const nameA = getPersonName(a.fromPersonId);
          const nameB = getPersonName(b.fromPersonId);
          return nameA.localeCompare(nameB, 'ja');
        default:
          return 0;
      }
    });

    return sorted;
  }, [relationships, searchQuery, filterType, confirmationFilter, sortOrder, getPersonName]);

  const handleRelationshipClick = useCallback((relationship: Relationship) => {
    setSelectedRelationship(relationship);
    setIsDetailModalOpen(true);
  }, []);

  const handleEditClick = useCallback((relationship: Relationship, event: React.MouseEvent) => {
    event.stopPropagation();
    onEdit(relationship);
  }, [onEdit]);

  const handleDeleteClick = useCallback((relationship: Relationship, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (showDeleteConfirmation) {
      setRelationshipToDelete(relationship);
      setIsDeleteModalOpen(true);
    } else {
      onDelete(relationship);
    }
  }, [onDelete, showDeleteConfirmation]);

  const handleConfirmDelete = useCallback(async () => {
    if (!relationshipToDelete) return;

    try {
      await deleteRelationship(relationshipToDelete.id);
      setIsDeleteModalOpen(false);
      setRelationshipToDelete(null);
    } catch (err) {
      console.error('Failed to delete relationship:', err);
    }
  }, [relationshipToDelete, deleteRelationship]);

  const handleConfirmationToggle = useCallback(async (relationship: Relationship) => {
    try {
      await updateRelationship(relationship.id, {
        isConfirmed: !relationship.isConfirmed,
      });
    } catch (err) {
      console.error('Failed to update relationship confirmation:', err);
    }
  }, [updateRelationship]);

  const handleRetry = useCallback(() => {
    loadRelationships(familyTreeId);
  }, [familyTreeId, loadRelationships]);

  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const formatMetadata = useCallback((relationship: Relationship): React.ReactNode[] => {
    const metadata = relationship.metadata;
    if (!metadata) return [];

    const items: React.ReactNode[] = [];

    if (metadata.marriageDate) {
      items.push(
        <span key="marriage" className="text-sm text-gray-600">
          結婚日: {formatDate(metadata.marriageDate)}
        </span>
      );
    }

    if (metadata.divorceDate) {
      items.push(
        <span key="divorce" className="text-sm text-gray-600">
          離婚日: {formatDate(metadata.divorceDate)}
        </span>
      );
    }

    if (metadata.adoptionDate) {
      items.push(
        <span key="adoption" className="text-sm text-gray-600">
          養子縁組日: {formatDate(metadata.adoptionDate)}
        </span>
      );
    }

    return items;
  }, [formatDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8" role="status" aria-live="polite">
        <div className="flex items-center space-x-2">
          <div 
            className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
            data-testid="loading-spinner"
          />
          <span className="text-gray-600">関係性を読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg" role="alert">
        <h3 className="text-lg font-medium text-red-800 mb-2">関係性の読み込みに失敗しました</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <Button variant="primary" onClick={handleRetry}>
          再試行
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" role="main">
      <header>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">関係性一覧</h2>
        
        {/* Filters and search */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Input
            type="text"
            placeholder="人物名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
              関係性タイプでフィルター
            </label>
            <select
              id="type-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">すべて</option>
              {Object.entries(RELATIONSHIP_TYPE_LABELS).map(([type, label]) => (
                <option key={type} value={type}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="confirmation-filter" className="block text-sm font-medium text-gray-700 mb-1">
              確認状況でフィルター
            </label>
            <select
              id="confirmation-filter"
              value={confirmationFilter}
              onChange={(e) => setConfirmationFilter(e.target.value as ConfirmationFilter)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">すべて</option>
              <option value="confirmed">確認済み</option>
              <option value="unconfirmed">未確認</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-1">
              並び順
            </label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
              <option value="alphabetical">名前順</option>
            </select>
          </div>
        </div>
      </header>

      {/* Results count */}
      <div role="status" aria-live="polite" className="text-sm text-gray-600">
        {filteredAndSortedRelationships.length}件の関係性が表示されています
      </div>

      {/* Relationship list */}
      {filteredAndSortedRelationships.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">
            {relationships.length === 0 ? '関係性がありません' : '条件に一致する関係性がありません'}
          </div>
          <div className="text-gray-500">
            {relationships.length === 0 
              ? '関係性を作成すると、ここに表示されます'
              : '検索条件を変更してみてください'
            }
          </div>
        </div>
      ) : (
        <ul className="space-y-4" role="list">
          {filteredAndSortedRelationships.map((relationship) => (
            <li
              key={relationship.id}
              data-testid={`relationship-item-${relationship.id}`}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleRelationshipClick(relationship)}
              role="listitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRelationshipClick(relationship);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg font-medium text-gray-900">
                      {getPersonName(relationship.fromPersonId)} ← {RELATIONSHIP_TYPE_LABELS[relationship.relationshipType]} → {getPersonName(relationship.toPersonId)}
                    </span>
                    
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-full
                      ${relationship.isConfirmed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                      }
                    `}>
                      {relationship.isConfirmed ? '確認済み' : '未確認'}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1">
                    {formatMetadata(relationship)}
                  </div>

                  <div className="text-sm text-gray-500 mt-2">
                    作成日: {formatDate(relationship.createdAt)}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {allowConfirmationToggle && !relationship.isConfirmed && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmationToggle(relationship);
                      }}
                    >
                      確認
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => handleEditClick(relationship, e)}
                    aria-label="編集"
                  >
                    編集
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={(e) => handleDeleteClick(relationship, e)}
                    aria-label="削除"
                  >
                    削除
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Relationship detail modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="関係性の詳細"
        size="md"
      >
        {selectedRelationship && (
          <div className="space-y-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-medium text-gray-900">
                {getPersonName(selectedRelationship.fromPersonId)} ← {RELATIONSHIP_TYPE_LABELS[selectedRelationship.relationshipType]} → {getPersonName(selectedRelationship.toPersonId)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">関係性タイプ:</span>
                <span className="ml-2 text-gray-900">{RELATIONSHIP_TYPE_LABELS[selectedRelationship.relationshipType]}</span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">確認状況:</span>
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                  selectedRelationship.isConfirmed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedRelationship.isConfirmed ? '確認済み' : '未確認'}
                </span>
              </div>

              <div>
                <span className="font-medium text-gray-700">作成日:</span>
                <span className="ml-2 text-gray-900">{formatDate(selectedRelationship.createdAt)}</span>
              </div>

              <div>
                <span className="font-medium text-gray-700">最終更新:</span>
                <span className="ml-2 text-gray-900">{formatDate(selectedRelationship.updatedAt)}</span>
              </div>
            </div>

            {/* Metadata details */}
            {selectedRelationship.metadata && Object.keys(selectedRelationship.metadata).length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-700 mb-2">追加情報</h4>
                <div className="space-y-2">
                  {formatMetadata(selectedRelationship)}
                  {selectedRelationship.metadata.notes && (
                    <div>
                      <span className="font-medium text-gray-700">備考:</span>
                      <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                        {selectedRelationship.metadata.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => setIsDetailModalOpen(false)}
                aria-label="閉じる"
              >
                閉じる
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="関係性を削除しますか？"
        size="md"
      >
        {relationshipToDelete && (
          <div className="space-y-4">
            <p className="text-gray-700">
              「{getPersonName(relationshipToDelete.fromPersonId)}」と「{getPersonName(relationshipToDelete.toPersonId)}」の{RELATIONSHIP_TYPE_LABELS[relationshipToDelete.relationshipType]}関係を削除しますか？
            </p>
            <p className="text-sm text-gray-500">
              この操作は取り消せません。
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
              >
                削除する
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Error display for delete failures */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <h4 className="text-sm font-medium text-red-800 mb-1">関係性の削除に失敗しました</h4>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};