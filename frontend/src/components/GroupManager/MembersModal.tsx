import { useState, useEffect } from 'react';
import { Search, UserPlus, UserMinus } from 'lucide-react';
import { Student, Teacher, Group } from '@/types/groupManager';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
  students: Student[];
  teachers: Teacher[];
  onSubmit: (studentIds: string[], teacherId?: string) => void;
}

export function MembersModal({
  open,
  onOpenChange,
  group,
  students,
  teachers,
  onSubmit,
}: MembersModalProps) {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string | undefined>();

  // Initialize selections when modal opens with a group
  useEffect(() => {
    if (group) {
      setSelectedStudents(group.students?.map(s => s.id.toString()) || []);
      setSelectedTeacher(group.teacher?.id.toString());
    } else {
      setSelectedStudents([]);
      setSelectedTeacher(undefined);
    }
  }, [group]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    onSubmit(
      selectedStudents,
      selectedTeacher
    );
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleTeacherToggle = (teacherId: string) => {
    setSelectedTeacher(prev =>
      prev === teacherId ? undefined : teacherId
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {group ? `Manage Members - ${group.name}` : 'Add Members'}
          </DialogTitle>
          <DialogDescription>
            Select students and assign a teacher for this group
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex space-x-4 mb-4">
            <button
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'students'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100'
              }`}
              onClick={() => setActiveTab('students')}
            >
              Students ({selectedStudents.length})
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'teachers'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100'
              }`}
              onClick={() => setActiveTab('teachers')}
            >
              Teacher {selectedTeacher ? '(1)' : '(0)'}
            </button>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'students' ? (
              <div className="space-y-2">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-500">
                        {student.email}
                      </div>
                    </div>
                    <button
                      onClick={() => handleStudentToggle(student.id.toString())}
                      className={`p-2 rounded-full transition-colors ${
                        selectedStudents.includes(student.id.toString())
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {selectedStudents.includes(student.id.toString()) ? (
                        <UserMinus className="w-4 h-4" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <div>
                      <div className="font-medium">{teacher.name}</div>
                      <div className="text-sm text-gray-500">
                        {teacher.email}
                      </div>
                    </div>
                    <button
                      onClick={() => handleTeacherToggle(teacher.id.toString())}
                      className={`p-2 rounded-full transition-colors ${
                        selectedTeacher === teacher.id.toString()
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {selectedTeacher === teacher.id.toString() ? (
                        <UserMinus className="w-4 h-4" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              onClick={handleSubmit}
            >
              Save Changes
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MembersModal;