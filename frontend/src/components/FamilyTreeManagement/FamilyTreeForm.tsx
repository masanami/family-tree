import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFamilyTree } from '../../hooks/useFamilyTree';
import type { FamilyTreeFormData } from '../../types/familyTree';

interface FormErrors {
  name?: string;
  description?: string;
}

export const FamilyTreeForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);

  const {
    currentFamilyTree,
    loading,
    error,
    createFamilyTree,
    updateFamilyTree,
    loadFamilyTree,
  } = useFamilyTree();

  const [formData, setFormData] = useState<FamilyTreeFormData>({
    name: '',
    description: '',
    isPublic: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  // Load family tree data in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadFamilyTree(id);
    }
  }, [isEditMode, id, loadFamilyTree]);

  // Populate form with existing data in edit mode
  useEffect(() => {
    if (isEditMode && currentFamilyTree) {
      setFormData({
        name: currentFamilyTree.name,
        description: currentFamilyTree.description || '',
        isPublic: currentFamilyTree.isPublic,
      });
    }
  }, [isEditMode, currentFamilyTree]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = '家系図名は必須です';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '家系図名は2文字以上で入力してください';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = '家系図名は100文字以内で入力してください';
    }

    // Description validation
    if (formData.description && formData.description.length > 500) {
      newErrors.description = '説明は500文字以内で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setIsDirty(true);

    // Clear specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && id) {
        await updateFamilyTree(id, formData);
      } else {
        await createFamilyTree(formData);
      }
      navigate('/family-trees');
    } catch (error) {
      // Error is handled by the hook
      console.error('Form submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelConfirmation(true);
    } else {
      navigate(-1);
    }
  };

  const confirmCancel = () => {
    setShowCancelConfirmation(false);
    navigate(-1);
  };

  const cancelConfirmation = () => {
    setShowCancelConfirmation(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div data-testid="loading-spinner" className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditMode ? '家系図を編集' : '新しい家系図を作成'}
          </h1>
        </div>

        <form role="form" onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              家系図名 *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
              placeholder="家系図の名前を入力してください"
            />
            {errors.name && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              説明
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
              placeholder="家系図の説明を入力してください（任意）"
              aria-describedby="description-help"
            />
            <p id="description-help" className="mt-1 text-sm text-gray-500">
              家系図の内容や目的について簡単に説明してください。
            </p>
            {errors.description && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.description}
              </p>
            )}
          </div>

          {/* Public Setting */}
          <div>
            <div className="flex items-start">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                  公開設定
                </label>
                <p className="text-sm text-gray-500">
                  チェックすると、他のユーザーがこの家系図を閲覧できるようになります。
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">
                {isEditMode ? '家系図の更新に失敗しました' : '家系図の作成に失敗しました'}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? isEditMode
                  ? '更新中...'
                  : '作成中...'
                : isEditMode
                ? '更新'
                : '作成'}
            </button>
          </div>
        </form>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">変更を破棄しますか？</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  入力した内容は保存されません。よろしいですか？
                </p>
              </div>
              <div className="flex justify-center space-x-3 px-4 py-3">
                <button
                  onClick={cancelConfirmation}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={confirmCancel}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  破棄する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};