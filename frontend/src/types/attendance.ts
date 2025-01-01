export interface Student {
    id: string;
    name: string;
  }
  
  export interface AttendanceRecord {
    id: string;
    studentId: string;
    studentName: string;
    classId: string;
    className: string;
    timestamp: string;
    status: 'present' | 'absent' | 'late';
  }
  
  export interface ClassSchedule {
    id: string;
    time: string;
    className: string;
    students: string[];
    type: 'Group' | 'Private';
    isOnline: boolean;
    proficiencyLevel: string;
  }