import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { groupService } from '../../services/api';
import { Group } from '@/types/groupManager';

interface GroupFormProps {
  onSubmit: () => void;
  onCancel: () => void;
  initialData?: Partial<Group>;
}

interface FormData {
  name: string;
  description: string;
  language: string;
  level: string;
  max_capacity: number;
  status: string;
}

const LANGUAGE_OPTIONS = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Chinese',
  'Japanese',
  'Korean',
];

const LEVEL_OPTIONS = [
  'Beginner',
  'Elementary',
  'Intermediate',
  'Upper Intermediate',
  'Advanced',
  'Proficient',
];

export const GroupForm: React.FC<GroupFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const defaultFormData: FormData = {
    name: '',
    description: '',
    language: '',
    level: '',
    max_capacity: 10,
    status: 'active'
  };

  const [formData, setFormData] = useState<FormData>({
    ...defaultFormData,
    ...initialData && {
      name: initialData.name ?? defaultFormData.name,
      description: initialData.description ?? defaultFormData.description,
      language: initialData.language ?? defaultFormData.language,
      level: initialData.level ?? defaultFormData.level,
      max_capacity: typeof initialData.max_capacity === 'number' ? initialData.max_capacity : defaultFormData.max_capacity,
      status: initialData.status ?? defaultFormData.status,
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.language) {
      newErrors.language = 'Language is required';
    }
    if (!formData.level) {
      newErrors.level = 'Level is required';
    }
    if (formData.max_capacity < 1) {
      newErrors.max_capacity = 'Maximum capacity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        name: formData.name,
        description: formData.description,
        language: formData.language,
        level: formData.level,
        max_capacity: Number(formData.max_capacity),
        status: formData.status
      };

      if (initialData?.id) {
        await groupService.updateGroup(Number(initialData.id), submitData);
      } else {
        await groupService.createGroup(submitData);
      }
      onSubmit();
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{initialData?.id ? 'Edit Group' : 'Create New Group'}</CardTitle>
          <CardDescription>
            Enter the group details below
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter group name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter group description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={formData.language}
              onValueChange={(value) => setFormData({ ...formData, language: value })}
            >
              <SelectTrigger className={errors.language ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.language && (
              <p className="text-sm text-red-500">{errors.language}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Select
              value={formData.level}
              onValueChange={(value) => setFormData({ ...formData, level: value })}
            >
              <SelectTrigger className={errors.level ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {LEVEL_OPTIONS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.level && (
              <p className="text-sm text-red-500">{errors.level}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_capacity">Maximum Capacity</Label>
            <Input
              id="max_capacity"
              type="number"
              min={1}
              value={formData.max_capacity.toString()}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setFormData({ ...formData, max_capacity: value });
              }}
              className={errors.max_capacity ? 'border-red-500' : ''}
            />
            {errors.max_capacity && (
              <p className="text-sm text-red-500">{errors.max_capacity}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData?.id ? 'Update' : 'Create'} Group
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default GroupForm;