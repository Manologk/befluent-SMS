export interface Student {
    id: string;
    name: string;
  }
  
  // export interface AttendanceRecord {
  //   id: string;
  //   studentId: string;
  //   studentName: string;
  //   classId: string;
  //   className: string;
  //   timestamp: string;
  //   status: 'present' | 'absent' | 'late';
  // }
  
  export interface ClassSchedule {
    id: string;
    time: string;
    className: string;
    students: string[];
    type: 'Group' | 'Private';
    isOnline: boolean;
    proficiencyLevel: string;
  }

export type AttendanceStatus = 'present' | 'absent' | 'late';

export type Language = 'english' | 'spanish' | 'french' | 'mandarin' | 'arabic';

export interface Student {
  id: string;
  name: string;
  grade: string;
  language: Language;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: AttendanceStatus;
  timeIn?: string;
  timeOut?: string;
  notes?: string;
  grade: string;
  language: Language;
}

export interface AttendanceFilters {
  dateRange: {
    start: string;
    end: string;
  };
  grade: string;
  studentSearch: string;
  status: AttendanceStatus | '';
  language: Language | '';
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
}