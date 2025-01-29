export interface Student {
  id: string;
  name: string;
  email: string;
  level: string;
  lessons_remaining: number;
  subscription_balance: number;
}

export type AttendanceStatus = 'present' | 'absent' | 'late';

export type SessionType = 'GROUP' | 'PRIVATE';
export type Language = 'Group' | 'Private';

export interface ClassSchedule {
  id: string;
  time: string;
  className: string;
  students: string[];
  type: 'Group' | 'Private';
  isOnline: boolean;
  proficiencyLevel: string;
}

export interface AttendanceRecord {
  id: string;
  student: {
    id: string;
    name: string;
    level?: string;
  };
  session: {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    type: 'GROUP' | 'PRIVATE';
  };
  scanned_at: string;
  valid: boolean;
  status: AttendanceStatus;
  // Computed properties for easier frontend display
  studentName: string;  // Computed from student.name
  date: string;        // Computed from session.date
  timeIn: string;      // Computed from session.start_time
  timeOut: string;     // Computed from session.end_time
  notes?: string;      // Optional notes field
  grade?: string;      // Optional grade field
  language?: string;   // Optional language field
  classId?: string;    // Optional class ID reference
}

export interface AttendanceFilters {
  studentSearch: string;
  level: string;
  status: AttendanceStatus | '';
  language: Language | '';
  dateRange: {
    start: string;
    end: string;
  };
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