import React, { useState, useEffect } from 'react';
import { Person } from '../../types/person';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';

interface PersonFormProps {
  person?: Person;
  onSubmit: (person: Omit<Person, 'id'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PersonForm: React.FC<PersonFormProps> = ({
  person,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    profileImage: '',
    bio: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (person) {
      setFormData({
        firstName: person.firstName || '',
        lastName: person.lastName || '',
        birthDate: person.birthDate || '',
        gender: person.gender || '',
        profileImage: person.profileImage || '',
        bio: person.bio || ''
      });
    }
  }, [person]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = '名前は必須項目です';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = '苗字は必須項目です';
    }

    if (formData.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(formData.birthDate)) {
      newErrors.birthDate = '正しい日付形式で入力してください (YYYY-MM-DD)';
    }

    if (formData.gender && !['male', 'female'].includes(formData.gender)) {
      newErrors.gender = '性別を選択してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        birthDate: formData.birthDate || undefined,
        gender: formData.gender as 'male' | 'female' | undefined,
        profileImage: formData.profileImage || undefined,
        bio: formData.bio || undefined
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="名前"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          error={errors.firstName}
          required
          disabled={isLoading}
        />
        
        <Input
          label="苗字"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          error={errors.lastName}
          required
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="生年月日"
          type="date"
          value={formData.birthDate}
          onChange={(e) => handleInputChange('birthDate', e.target.value)}
          error={errors.birthDate}
          disabled={isLoading}
        />
        
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
            性別
          </label>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            disabled={isLoading}
          >
            <option value="">選択してください</option>
            <option value="male">男性</option>
            <option value="female">女性</option>
          </select>
          {errors.gender && (
            <p className="text-sm text-red-600 mt-1">{errors.gender}</p>
          )}
        </div>
      </div>

      <Input
        label="プロフィール画像URL"
        type="url"
        value={formData.profileImage}
        onChange={(e) => handleInputChange('profileImage', e.target.value)}
        error={errors.profileImage}
        disabled={isLoading}
      />

      <Input
        label="自己紹介"
        type="textarea"
        value={formData.bio}
        onChange={(e) => handleInputChange('bio', e.target.value)}
        error={errors.bio}
        disabled={isLoading}
      />

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? '保存中...' : (person ? '更新' : '追加')}
        </Button>
      </div>
    </form>
  );
};