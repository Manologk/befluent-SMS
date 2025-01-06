export interface Student {
    id: string;
    name: string;
  }
  
  export type AttendanceStatus = 'present' | 'absent' | 'late';

export type Language = 'english' | 'spanish' | 'french' | 'mandarin' | 'arabic';

export interface ClassSchedule {
    id: string;
    time: string;
    className: string;
    students: string[];
    type: 'Group' | 'Private';
    isOnline: boolean;
    proficiencyLevel: string;
}

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
  language: string;
}

export interface AttendanceFilters {
  dateRange: {
    start: string;
    end: string;
  };
  level: string;
  studentSearch: string;
  status: string;
  language: string;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
}

export interface AttendanceUpdateResponse {
  attendance: AttendanceRecord;
  lessons_remaining: number;
  subscription_balance: number;
}