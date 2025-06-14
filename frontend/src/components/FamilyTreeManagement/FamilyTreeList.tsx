import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFamilyTree } from '../../hooks/useFamilyTree';
import { useAuth } from '../../hooks/useAuth';
import type { FamilyTree } from '../../types/familyTree';

interface DeleteConfirmationState {
  isOpen: boolean;
  familyTreeId: string | null;
  familyTreeName: string;
}

export const FamilyTreeList: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    familyTrees,
    loading,
    error,
    hasMore,
    loadFamilyTrees,
    loadMore,
    deleteFamilyTree,
  } = useFamilyTree();

  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationState>({
    isOpen: false,
    familyTreeId: null,
    familyTreeName: '',
  });

  // Load family trees on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadFamilyTrees();
    }
  }, [isAuthenticated, loadFamilyTrees]);

  const handleCreateNew = () => {
    navigate('/family-trees/new');
  };

  const handleFamilyTreeClick = (familyTreeId: string) => {
    navigate(`/family-trees/${familyTreeId}`);
  };

  const handleEditClick = (e: React.MouseEvent, familyTreeId: string) => {
    e.stopPropagation();
    navigate(`/family-trees/${familyTreeId}/edit`);
  };

  const handleDeleteClick = (e: React.MouseEvent, familyTree: FamilyTree) => {
    e.stopPropagation();
    setDeleteConfirmation({
      isOpen: true,
      familyTreeId: familyTree.id,
      familyTreeName: familyTree.name,
    });
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.familyTreeId) {
      try {
        await deleteFamilyTree(deleteConfirmation.familyTreeId);
        setDeleteConfirmation({
          isOpen: false,
          familyTreeId: null,
          familyTreeName: '',
        });
      } catch (error) {
        console.error('Failed to delete family tree:', error);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      familyTreeId: null,
      familyTreeName: '',
    });
  };

  const handleRetry = () => {
    loadFamilyTrees();
  };

  const handleLoadMore = () => {
    loadMore();
  };

  const isOwner = (familyTree: FamilyTree): boolean => {
    return user?.id === familyTree.ownerId;
  };

  const isShared = (familyTree: FamilyTree): boolean => {
    return !isOwner(familyTree);
  };

  const formatMembersCount = (count?: number): string => {
    if (!count) return '0人のメンバー';
    return `${count}人のメンバー`;
  };

  // Loading state
  if (loading && familyTrees.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div data-testid="loading-spinner" className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">読み込み中...</span>
      </div>
    );
  }

  // Error state
  if (error && familyTrees.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <h3 className="text-lg font-medium">エラーが発生しました</h3>
          <p className="text-sm mt-2">{error}</p>
        </div>
        <button
          onClick={handleRetry}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          再試行
        </button>
      </div>
    );
  }

  // Empty state
  if (!loading && familyTrees.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-6">
          <h3 className="text-lg font-medium">家系図がありません</h3>
          <p className="text-sm mt-2">最初の家系図を作成しましょう</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-6 py-3 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          新しい家系図を作成
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">家系図一覧</h1>
        <button
          onClick={handleCreateNew}
          className="px-6 py-3 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          新しい家系図を作成
        </button>
      </div>

      {/* Family Tree Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {familyTrees.map((familyTree) => (
          <div
            key={familyTree.id}
            data-testid="family-tree-card"
            onClick={() => handleFamilyTreeClick(familyTree.id)}
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="p-6">
              {/* Header with title and badges */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {familyTree.name}
                </h3>
                <div className="flex space-x-2">
                  {isOwner(familyTree) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      所有者
                    </span>
                  )}
                  {isShared(familyTree) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      共有
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {familyTree.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {familyTree.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{formatMembersCount(familyTree.membersCount)}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  familyTree.isPublic 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {familyTree.isPublic ? '公開' : 'プライベート'}
                </span>
              </div>

              {/* Shared with info */}
              {familyTree.sharedWith && familyTree.sharedWith.length > 0 && (
                <div className="text-xs text-gray-400 mb-4">
                  {familyTree.sharedWith[0].userName}さんと共有
                  {familyTree.sharedWith.length > 1 && (
                    <span> 他{familyTree.sharedWith.length - 1}人</span>
                  )}
                </div>
              )}

              {/* Actions - Only show for owned trees */}
              {isOwner(familyTree) && (
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => handleEditClick(e, familyTree.id)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    編集
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, familyTree)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    削除
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '読み込み中...' : 'さらに読み込む'}
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">家系図を削除しますか？</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  この操作は取り消せません。「{deleteConfirmation.familyTreeName}」を完全に削除しますか？
                </p>
              </div>
              <div className="flex justify-center space-x-3 px-4 py-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};