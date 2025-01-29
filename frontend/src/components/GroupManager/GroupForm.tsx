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
  'Korean'
];

const LEVEL_OPTIONS = [
  'Beginner',
  'Elementary',
  'Pre-Intermediate',
  'Intermediate',
  'Upper-Intermediate',
  'Advanced',
  'Proficiency'
];

const GroupForm: React.FC<GroupFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    language: initialData?.language || '',
    level: initialData?.level || '',
    max_capacity: initialData?.max_capacity || 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData?.id) {
        await groupService.updateGroup(Number(initialData.id), {
          name: formData.name,
          description: formData.description,
          language: formData.language,
          level: formData.level,
          max_capacity: formData.max_capacity,
        });
      } else {
        await groupService.createGroup({
          name: formData.name,
          description: formData.description,
          language: formData.language,
          level: formData.level,
          max_capacity: formData.max_capacity,
        });
      }
      onSubmit();
    } catch (error) {
      console.error('Error submitting group form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{initialData ? 'Edit Group' : 'Create New Group'}</CardTitle>
          <CardDescription>
            {initialData 
              ? 'Update the group details below' 
              : 'Fill in the details below to create a new group'}
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
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter group description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={formData.language}
              onValueChange={(value) => setFormData({ ...formData, language: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <SelectItem key={lang} value={lang.toLowerCase()}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Select
              value={formData.level}
              onValueChange={(value) => setFormData({ ...formData, level: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a level" />
              </SelectTrigger>
              <SelectContent>
                {LEVEL_OPTIONS.map((level) => (
                  <SelectItem key={level} value={level.toLowerCase()}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_capacity">Maximum Capacity</Label>
            <Input
              id="max_capacity"
              type="number"
              value={formData.max_capacity}
              onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) })}
              min={1}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update Group' : 'Create Group'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default GroupForm;