import { useState, useEffect, useMemo } from 'react';
import { X, Search, UserPlus, UserMinus, 
  // Users
 } from 'lucide-react';
import { Student, Teacher, Group } from '@/types/groupManager';
import { studentApi, teacherApi } from '@/services/api';

interface MembersModalProps {
  open: boolean;
  group: Group;
  onClose: () => void;
  onUpdate: (groupId: string, studentIds: string[], teacherIds: string[]) => void;
}

export function MembersModal({
  open,
  group,
  onClose,
  onUpdate,
}: MembersModalProps) {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [localStudentIds, setLocalStudentIds] = useState<string[]>([]);
  const [localTeacherIds, setLocalTeacherIds] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Update local state when group changes
  useEffect(() => {
    if (group) {
      const studentIds = group.students?.map(student => student.id.toString()) || [];
      const teacherIds = group.teacher ? [group.teacher.id.toString()] : [];
      setLocalStudentIds(studentIds);
      setLocalTeacherIds(teacherIds);
    }
  }, [group]);

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const studentsData = await studentApi.getAll();
        console.log('Student API Response:', studentsData);
        if (Array.isArray(studentsData)) {
          setStudents(studentsData);
        } else {
          console.error('Unexpected response format:', studentsData);
          throw new Error('Invalid response format');
        }
      } catch (err) {
        setError('Failed to load students. Please try again later.');
        console.error('Error fetching students:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTeachers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const teachersData = await teacherApi.getAll();
        console.log('Teacher API Response:', teachersData);
        if (Array.isArray(teachersData)) {
          setTeachers(teachersData);
        } else {
          console.error('Unexpected response format:', teachersData);
          throw new Error('Invalid response format');
        }
      } catch (err) {
        setError('Failed to load teachers. Please try again later.');
        console.error('Error fetching teachers:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchStudents();
      fetchTeachers();
    }
  }, [open]);

  const currentStudents = useMemo(() => {
    if (!group?.students) return [];
    return group.students;
  }, [group]);

  const currentTeachers = useMemo(() => {
    if (!group?.teacher) return [];
    return [group.teacher];
  }, [group]);

  const searchResults = useMemo(() => {
    setIsSearching(true);
    try {
      const results = activeTab === 'students'
        ? students.filter(student => 
            !localStudentIds.includes(student.id.toString()) && (
              student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (student.level || '').toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
        : teachers.filter(teacher =>
            !localTeacherIds.includes(teacher.id.toString()) && (
              teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (teacher.specializations || []).join(' ').toLowerCase().includes(searchTerm.toLowerCase())
            )
          );
      setIsSearching(false);
      return results;
    } catch (error) {
      setIsSearching(false);
      return [];
    }
  }, [activeTab, students, teachers, localStudentIds, localTeacherIds, searchTerm]);

  const toggleMember = async (id: string) => {
    try {
      setIsUpdating(true);
      if (activeTab === 'students') {
        const newStudentIds = localStudentIds.includes(id)
          ? localStudentIds.filter(studentId => studentId !== id)
          : [...localStudentIds, id];
        setLocalStudentIds(newStudentIds);
        await onUpdate(group.id, newStudentIds, localTeacherIds);
      } else {
        // For teachers, we only allow one at a time
        const newTeacherIds = localTeacherIds.includes(id)
          ? [] // Remove the teacher
          : [id]; // Set as the only teacher
        setLocalTeacherIds(newTeacherIds);
        await onUpdate(group.id, localStudentIds, newTeacherIds);
      }
    } catch (error) {
      console.error('Error toggling member:', error);
      // Revert the local state on error
      if (activeTab === 'students') {
        setLocalStudentIds(group.students?.map(s => s.id.toString()) || []);
      } else {
        setLocalTeacherIds(group.teacher ? [group.teacher.id.toString()] : []);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const renderToggleButton = (id: string, isRemove: boolean) => {
    const Icon = isRemove ? UserMinus : UserPlus;
    const buttonClass = isRemove
      ? 'bg-red-100 text-red-600 hover:bg-red-200'
      : 'bg-green-100 text-green-600 hover:bg-green-200';
    
    return (
      <button
        onClick={() => toggleMember(id)}
        disabled={isUpdating}
        className={`p-2 rounded-lg transition-colors ${buttonClass} ${
          isUpdating ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={isRemove ? 'Remove from group' : 'Add to group'}
      >
        {isUpdating ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
        ) : (
          <Icon size={20} />
        )}
      </button>
    );
  };

  const renderMemberList = (items: (Student | Teacher)[], type: 'students' | 'teachers') => {
    return items.map((item) => {
      const isSelected = type === 'students' 
        ? localStudentIds.includes(item.id.toString())
        : localTeacherIds.includes(item.id.toString());

      return (
        <div
          key={item.id}
          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
        >
          <div>
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-sm text-gray-500">
              {type === 'students' 
                ? `Grade: ${(item as Student).name} • ${item.email}`
                : `Subject: ${(item as Teacher).name} • ${item.email}`}
            </p>
          </div>
          {renderToggleButton(item.id.toString(), isSelected)}
        </div>
      );
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {group.name} - Manage {activeTab === 'students' ? 'Students' : 'Teachers'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex-1 flex flex-col min-h-0">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                setActiveTab('students');
                setSearchTerm('');
                setIsSearching(false);
              }}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'students'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Students ({currentStudents.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('teachers');
                setSearchTerm('');
                setIsSearching(false);
              }}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'teachers'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Teachers ({currentTeachers.length})
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex-1 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="flex-1 flex gap-6 min-h-0">
              {/* Current Members Section */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    Current {activeTab === 'students' ? 'Students' : 'Teachers'} ({activeTab === 'students' ? currentStudents.length : currentTeachers.length})
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                  {activeTab === 'students' 
                    ? renderMemberList(currentStudents, 'students')
                    : renderMemberList(currentTeachers, 'teachers')
                  }
                </div>
              </div>

              {/* Add Members Section */}
              <div className="flex-1 flex flex-col min-h-0 border-l pl-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    Add {activeTab === 'students' ? 'Students' : 'Teachers'}
                  </h3>
                </div>
                <div className="relative mb-4 flex-shrink-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab === 'students' ? 'students' : 'teachers'}...`}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsSearching(true);
                    }}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                  {isSearching ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {renderMemberList(searchResults, activeTab)}
                    </div>
                  ) : searchTerm ? (
                    <p className="text-gray-500 text-center py-4">No {activeTab} found matching "{searchTerm}"</p>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MembersModal;