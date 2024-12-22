export interface Student {
    id: string;
    name: string;
  }
  
  export interface AttendanceRecord {
    studentId: string;
    classId: string;
    timestamp: string;
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