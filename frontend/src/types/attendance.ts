export interface Student {
    id: string;
    name: string;
    email: string;
    grade: string;
    language: Language;
    qr_code: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type Language = 'ENGLISH' | 'FRENCH' | 'SPANISH' | 'GERMAN' | 'CHINESE';

export interface ClassSchedule {
    id: string;
    time: string;
    className: string;
    students: string[];
    type: 'Group' | 'Private';
    isOnline: boolean;
    proficiencyLevel: string;
}

export interface AttendanceFilters {
    startDate: string;
    endDate: string;
    studentId?: string;
    status?: AttendanceStatus;
    language?: Language;
    grade?: string;
    groupId?: string;
}

export interface AttendanceRecord {
    id: string;
    studentName: string;
    studentId: string;
    grade: string;
    language: string | null;
    date: string;
    status: AttendanceStatus;
    notes?: string;
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