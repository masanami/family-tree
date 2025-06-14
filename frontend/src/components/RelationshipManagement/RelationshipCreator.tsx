import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '../../../issue-37-person-management/frontend/src/components/UI/Button';
import { Modal } from '../../../issue-37-person-management/frontend/src/components/UI/Modal';
import { Input } from '../../../issue-37-person-management/frontend/src/components/UI/Input';
import { useDragDrop } from '../../hooks/useDragDrop';
import { useRelationship } from '../../hooks/useRelationship';
import type { Person } from '../../types/person';
import type { RelationshipType, RelationshipFormData } from '../../types/relationship';

interface RelationshipCreatorProps {
  persons: Person[];
  familyTreeId: string;
  onRelationshipCreated: () => void;
}

const RELATIONSHIP_TYPES: Array<{ value: RelationshipType; label: string; metadata?: string[] }> = [
  { value: 'spouse', label: '配偶者', metadata: ['marriageDate', 'divorceDate', 'notes'] },
  { value: 'parent', label: '親', metadata: ['adoptionDate', 'notes'] },
  { value: 'child', label: '子', metadata: ['adoptionDate', 'notes'] },
  { value: 'sibling', label: '兄弟・姉妹', metadata: ['notes'] },
  { value: 'grandparent', label: '祖父母', metadata: ['notes'] },
  { value: 'grandchild', label: '孫', metadata: ['notes'] },
  { value: 'uncle_aunt', label: '叔父・叔母', metadata: ['notes'] },
  { value: 'nephew_niece', label: '甥・姪', metadata: ['notes'] },
  { value: 'cousin', label: 'いとこ', metadata: ['notes'] },
];

export const RelationshipCreator: React.FC<RelationshipCreatorProps> = ({
  persons,
  familyTreeId,
  onRelationshipCreated,
}) => {
  const {
    dragSource,
    dragTarget,
    isDragging,
    dragPreview,
    startDrag,
    endDrag,
    setDragTarget,
    clearDragTarget,
    isValidDrop,
    getDragData,
  } = useDragDrop();

  const {
    createRelationship,
    validateRelationship,
    loading,
    error,
  } = useRelationship();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRelationshipType, setSelectedRelationshipType] = useState<RelationshipType | null>(null);
  const [formData, setFormData] = useState<RelationshipFormData>({
    fromPersonId: '',
    toPersonId: '',
    relationshipType: 'spouse',
    metadata: {},
  });
  const [validationError, setValidationError] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const sourcePersonName = useMemo(() => {
    if (!dragSource) return '';
    const person = persons.find(p => p.id === dragSource);
    return person ? `${person.lastName} ${person.firstName}` : '';
  }, [dragSource, persons]);

  const targetPersonName = useMemo(() => {
    if (!dragTarget) return '';
    const person = persons.find(p => p.id === dragTarget);
    return person ? `${person.lastName} ${person.firstName}` : '';
  }, [dragTarget, persons]);

  const handleDragStart = useCallback((personId: string, event: React.DragEvent) => {
    const person = persons.find(p => p.id === personId);
    if (!person) return;

    const rect = event.currentTarget.getBoundingClientRect();
    startDrag(personId, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      sourcePersonName: `${person.lastName} ${person.firstName}`,
    });
  }, [persons, startDrag]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!isDragging) return;

    // Update drag preview position
    const rect = event.currentTarget.getBoundingClientRect();
    // Position update logic would be handled by useDragDrop hook
  }, [isDragging]);

  const handleDragEnter = useCallback((personId: string, event: React.DragEvent) => {
    event.preventDefault();
    if (!isDragging || dragSource === personId) return;
    setDragTarget(personId);
  }, [isDragging, dragSource, setDragTarget]);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    // Only clear if leaving the entire card area
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      clearDragTarget();
    }
  }, [clearDragTarget]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    
    if (!isValidDrop()) {
      endDrag();
      return;
    }

    const dragData = getDragData();
    if (!dragData || dragData.source === dragData.target) {
      setValidationError(['自分自身との関係性は作成できません']);
      endDrag();
      return;
    }

    // Open relationship selection modal
    setFormData({
      fromPersonId: dragData.source,
      toPersonId: dragData.target,
      relationshipType: 'spouse',
      metadata: {},
    });
    setIsModalOpen(true);
    endDrag();
  }, [isValidDrop, getDragData, endDrag]);

  const handleRelationshipTypeChange = useCallback((type: RelationshipType) => {
    setSelectedRelationshipType(type);
    setFormData(prev => ({
      ...prev,
      relationshipType: type,
    }));

    // Validate the relationship
    if (formData.fromPersonId && formData.toPersonId) {
      const validation = validateRelationship(formData.fromPersonId, formData.toPersonId, type);
      setValidationError(validation.errors);
      setValidationWarnings(validation.warnings || []);
    }
  }, [formData.fromPersonId, formData.toPersonId, validateRelationship]);

  const handleMetadataChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value,
      },
    }));
  }, []);

  const handleCreateRelationship = useCallback(async () => {
    if (!selectedRelationshipType || validationError.length > 0) return;

    try {
      await createRelationship({
        fromPersonId: formData.fromPersonId,
        toPersonId: formData.toPersonId,
        relationshipType: formData.relationshipType,
        familyTreeId,
        metadata: formData.metadata,
      });

      setIsModalOpen(false);
      setSelectedRelationshipType(null);
      setFormData({
        fromPersonId: '',
        toPersonId: '',
        relationshipType: 'spouse',
        metadata: {},
      });
      setValidationError([]);
      setValidationWarnings([]);
      onRelationshipCreated();
    } catch (err) {
      console.error('Failed to create relationship:', err);
    }
  }, [selectedRelationshipType, validationError, formData, familyTreeId, createRelationship, onRelationshipCreated]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedRelationshipType(null);
    setFormData({
      fromPersonId: '',
      toPersonId: '',
      relationshipType: 'spouse',
      metadata: {},
    });
    setValidationError([]);
    setValidationWarnings([]);
  }, []);

  const selectedRelationshipConfig = useMemo(() => {
    return RELATIONSHIP_TYPES.find(rt => rt.value === selectedRelationshipType);
  }, [selectedRelationshipType]);

  return (
    <div className="space-y-4">
      {/* Status indicator for screen readers */}
      {isDragging && (
        <div role="status" aria-live="polite" className="sr-only">
          {sourcePersonName}をドラッグ中。関係性を作成したい人物の上にドロップしてください。
        </div>
      )}

      {/* Person cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {persons.map((person) => (
          <div
            key={person.id}
            data-testid={`person-card-${person.id}`}
            draggable
            onDragStart={(e) => handleDragStart(person.id, e)}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(person.id, e)}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              p-4 border-2 border-gray-200 rounded-lg cursor-move
              transition-all duration-200
              ${dragSource === person.id ? 'opacity-50 bg-blue-50' : ''}
              ${dragTarget === person.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
              ${isDragging && dragSource !== person.id ? 'hover:ring-2 hover:ring-blue-300' : ''}
            `}
            role="button"
            aria-label={`${person.lastName} ${person.firstName} - ドラッグして関係性を作成`}
            tabIndex={0}
          >
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {person.lastName} {person.firstName}
              </div>
              <div className="text-sm text-gray-500">
                {person.birthDate ? new Date(person.birthDate).toLocaleDateString('ja-JP') : ''}
              </div>
              <div className="text-xs text-gray-400 capitalize">
                {person.gender === 'male' ? '男性' : person.gender === 'female' ? '女性' : 'その他'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Relationship selection modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="関係性を選択してください"
        size="lg"
      >
        <div className="space-y-6">
          {/* Relationship preview */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-medium text-gray-900">
              {sourcePersonName} → {targetPersonName}
            </div>
          </div>

          {/* Validation messages */}
          {validationError.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <h4 className="text-sm font-medium text-red-800 mb-2">エラー</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {validationError.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {validationWarnings.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg" role="alert">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">警告</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {validationWarnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Relationship type selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              関係性タイプ
            </label>
            <div className="grid grid-cols-2 gap-2">
              {RELATIONSHIP_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`
                    flex items-center p-3 border rounded-lg cursor-pointer
                    transition-colors duration-200
                    ${selectedRelationshipType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="relationshipType"
                    value={type.value}
                    checked={selectedRelationshipType === type.value}
                    onChange={() => handleRelationshipTypeChange(type.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Metadata fields */}
          {selectedRelationshipConfig?.metadata && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">追加情報</h4>
              
              {selectedRelationshipConfig.metadata.includes('marriageDate') && (
                <Input
                  type="date"
                  label="結婚日"
                  value={formData.metadata?.marriageDate || ''}
                  onChange={(e) => handleMetadataChange('marriageDate', e.target.value)}
                />
              )}
              
              {selectedRelationshipConfig.metadata.includes('divorceDate') && (
                <Input
                  type="date"
                  label="離婚日（任意）"
                  value={formData.metadata?.divorceDate || ''}
                  onChange={(e) => handleMetadataChange('divorceDate', e.target.value)}
                />
              )}
              
              {selectedRelationshipConfig.metadata.includes('adoptionDate') && (
                <Input
                  type="date"
                  label="養子縁組日（任意）"
                  value={formData.metadata?.adoptionDate || ''}
                  onChange={(e) => handleMetadataChange('adoptionDate', e.target.value)}
                />
              )}
              
              {selectedRelationshipConfig.metadata.includes('notes') && (
                <Input
                  type="textarea"
                  label="備考（任意）"
                  placeholder="関係性に関する追加情報を入力してください"
                  value={formData.metadata?.notes || ''}
                  onChange={(e) => handleMetadataChange('notes', e.target.value)}
                />
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
            >
              キャンセル
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateRelationship}
              disabled={!selectedRelationshipType || validationError.length > 0 || loading}
            >
              {loading ? '作成中...' : '関係性を作成'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <h4 className="text-sm font-medium text-red-800 mb-1">関係性の作成に失敗しました</h4>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};