import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { groupService } from '../../services/api';
import GroupForm from './GroupForm';
import GroupList from './GroupList';
import MembersModal from './MembersModal';
import { Student, Teacher, Group, mockStudents, mockTeachers } from '@/types/groupManager';

export const GroupManagement: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const fetchGroups = async () => {
    try {
      const response = await groupService.getGroups();
      setGroups(response.data);
      // Update selectedGroup if it exists
      if (selectedGroup) {
        const updatedGroup = response.data.find(g => g.id === selectedGroup.id);
        if (updatedGroup) {
          setSelectedGroup(updatedGroup);
        }
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = () => {
    setSelectedGroup(null);
    setIsFormOpen(true);
  };

  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setIsFormOpen(true);
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await groupService.deleteGroup(groupId);
        await fetchGroups();
      } catch (error) {
        console.error('Error deleting group:', error);
      }
    }
  };

  const handleManageMembers = (group: Group) => {
    setSelectedGroup(group);
    setIsMembersModalOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedGroup(null);
  };

  const handleFormSubmit = async () => {
    await fetchGroups();
    setIsFormOpen(false);
    setSelectedGroup(null);
  };

  const handleMembersModalClose = () => {
    setIsMembersModalOpen(false);
    setSelectedGroup(null);
  };

  const handleMembersUpdate = async (groupId: string, studentIds: string[], teacherIds: string[]) => {
    try {
      if (!selectedGroup) return;
      
      // Find which students were added and which were removed
      const currentStudentIds = selectedGroup.students?.map(s => s.id.toString()) || [];
      const addedStudents = studentIds.filter(id => !currentStudentIds.includes(id));
      const removedStudents = currentStudentIds.filter(id => !studentIds.includes(id));

      // Handle teacher changes
      const currentTeacherId = selectedGroup.teacher?.id.toString();
      const newTeacherId = teacherIds[0]; // Only one teacher allowed

      // Add new students
      if (addedStudents.length > 0) {
        await groupService.addStudentsToGroup(
          parseInt(groupId), 
          addedStudents.map(id => parseInt(id))
        );
      }

      // Remove students
      for (const studentId of removedStudents) {
        await groupService.removeStudentFromGroup(
          parseInt(groupId),
          parseInt(studentId)
        );
      }

      // Update teacher if changed
      if (newTeacherId !== currentTeacherId) {
        if (newTeacherId) {
          // Assign new teacher
          await groupService.assignTeacherToGroup(parseInt(groupId), parseInt(newTeacherId));
        } else {
          // Remove current teacher
          await groupService.removeTeacherFromGroup(parseInt(groupId));
        }
      }
      
      // Refresh the groups list and update selected group
      await fetchGroups();
    } catch (error) {
      console.error('Error updating group members:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Group Management</h1>
        <Button onClick={handleCreateGroup}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading groups...</div>
        ) : (
          <GroupList
            groups={groups}
            onEdit={handleEditGroup}
            onDelete={handleDeleteGroup}
            onManageMembers={handleManageMembers}
          />
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedGroup ? 'Edit Group' : 'Create New Group'}
            </DialogTitle>
            <DialogDescription>
              {selectedGroup
                ? 'Update the group details below'
                : 'Fill in the group details below'}
            </DialogDescription>
          </DialogHeader>
          <GroupForm
            initialData={selectedGroup || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Members Modal */}
      {selectedGroup && (
        <MembersModal
          open={isMembersModalOpen}
          group={selectedGroup}
          onClose={handleMembersModalClose}
          onUpdate={handleMembersUpdate}
        />
      )}
    </div>
  );
};

export default GroupManagement;