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
import { groupService, studentApi, teacherApi } from '../../services/api';
import GroupForm from './GroupForm';
import GroupList from './GroupList';
import MembersModal from './MembersModal';
import { Student, Teacher, Group } from '@/types/groupManager';
import { toast } from 'react-hot-toast';

export const GroupManagement: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [newlyCreatedGroup, setNewlyCreatedGroup] = useState<Group | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsResponse, teachersResponse, studentsResponse] = await Promise.all([
        groupService.getGroups(),
        teacherApi.getAll(),
        studentApi.getAll()
      ]);

      setGroups(groupsResponse.data || []);

      // Transform and set teachers
      const transformedTeachers = (Array.isArray(teachersResponse) ? teachersResponse : []).map((teacher: {
        id: string;
        name: string;
        email: string;
        phone_number?: string;
        specializations?: string[];
      }): Teacher => ({
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        specializations: teacher.specializations || [],
        phone_number: teacher.phone_number
      }));
      setTeachers(transformedTeachers);

      // Transform and set students
      const transformedStudents = (Array.isArray(studentsResponse) ? studentsResponse : []).map((student: {
        id: string;
        name: string;
        email: string;
        level?: string;
        phone_number?: string;
        subscription_plan?: string;
        lessons_remaining?: number;
        subscription_balance?: number;
        qr_code?: string;
      }): Student => ({
        id: student.id,
        name: student.name,
        email: student.email,
        level: student.level || '',
        phone_number: student.phone_number,
        subscription_plan: student.subscription_plan,
        lessons_remaining: student.lessons_remaining,
        subscription_balance: student.subscription_balance,
        qr_code: student.qr_code
      }));
      setStudents(transformedStudents);

      // Update selectedGroup if it exists
      if (selectedGroup) {
        const updatedGroup = groupsResponse.data?.find((g: Group) => g.id === selectedGroup.id);
        if (updatedGroup) {
          setSelectedGroup(updatedGroup);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
      // Initialize with empty arrays on error
      setGroups([]);
      setStudents([]);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateGroup = () => {
    setSelectedGroup(null);
    setIsFormOpen(true);
  };

  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setIsFormOpen(true);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await groupService.deleteGroup(Number(groupId));
        await fetchData();
        toast.success('Group deleted successfully');
      } catch (error) {
        console.error('Error deleting group:', error);
        toast.error('Failed to delete group');
      }
    }
  };

  const handleManageMembers = (group: Group) => {
    if (!loading) {
      setSelectedGroup(group);
      setIsMembersModalOpen(true);
    }
  };

  const handleFormSubmit = async () => {
    await fetchData();
    setIsFormOpen(false);
    
    // If we were creating a new group, show the manage members dialog
    if (!selectedGroup && !loading) {
      const newGroup = groups[groups.length - 1]; // Get the latest group
      setNewlyCreatedGroup(newGroup);
      setShowManageMembers(true);
    }
    
    setSelectedGroup(null);
    toast.success(`Group ${selectedGroup ? 'updated' : 'created'} successfully`);
  };

  const handleMembersUpdate = async (studentIds: string[], teacherId?: string) => {
    try {
      if (!selectedGroup) return;

      // Get current student IDs
      const currentStudentIds = selectedGroup.students?.map(s => s.id) || [];
      
      // Find students to add and remove
      const studentsToAdd = studentIds.filter(id => !currentStudentIds.includes(id));
      const studentsToRemove = currentStudentIds.filter(id => !studentIds.includes(id));

      // Handle teacher change
      const currentTeacherId = selectedGroup.teacher?.id;
      if (teacherId !== currentTeacherId) {
        if (teacherId) {
          await groupService.assignTeacherToGroup(Number(selectedGroup.id), Number(teacherId));
        } else if (currentTeacherId) {
          await groupService.removeTeacherFromGroup(Number(selectedGroup.id));
        }
      }

      // Add new students
      if (studentsToAdd.length > 0) {
        await groupService.addStudentsToGroup(
          Number(selectedGroup.id),
          studentsToAdd.map(id => Number(id))
        );
      }

      // Remove students
      for (const studentId of studentsToRemove) {
        await groupService.removeStudentFromGroup(
          Number(selectedGroup.id),
          Number(studentId)
        );
      }

      await fetchData(); // Refresh data
      setIsMembersModalOpen(false);
      toast.success('Group members updated successfully');
    } catch (error) {
      console.error('Error updating group members:', error);
      toast.error('Failed to update group members');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Group Management</h1>
        <Button onClick={handleCreateGroup}>
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      <GroupList
        groups={groups}
        onEdit={handleEditGroup}
        onDelete={handleDeleteGroup}
        onManageMembers={handleManageMembers}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedGroup ? 'Edit Group' : 'Create New Group'}</DialogTitle>
            <DialogDescription>
              {selectedGroup
                ? 'Update the group details below'
                : 'Fill in the details below to create a new group'}
            </DialogDescription>
          </DialogHeader>
          <GroupForm
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            initialData={selectedGroup || undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Show manage members prompt after creating a group */}
      <Dialog 
        open={showManageMembers} 
        onOpenChange={(open) => {
          setShowManageMembers(open);
          if (!open) {
            setNewlyCreatedGroup(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Members to New Group</DialogTitle>
            <DialogDescription>
              Would you like to add members to your newly created group?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowManageMembers(false)}>
              Skip for Now
            </Button>
            <Button 
              onClick={() => {
                setShowManageMembers(false);
                setSelectedGroup(newlyCreatedGroup);
                setIsMembersModalOpen(true);
              }}
            >
              Add Members
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Members management modal */}
      <MembersModal
        open={isMembersModalOpen}
        onOpenChange={setIsMembersModalOpen}
        group={selectedGroup}
        students={students || []}
        teachers={teachers || []}
        onSubmit={handleMembersUpdate}
      />
    </div>
  );
};

export default GroupManagement;