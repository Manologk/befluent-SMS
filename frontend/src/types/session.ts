export interface ClassSchedule {
  id: string;
  time: string;
  className: string;
  isOnline: boolean;
  students: string[];
  proficiencyLevel: string;
}

export interface TeacherSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'GROUP' | 'PRIVATE';
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  sessionId: string;
  timestamp: string;
  status: 'present' | 'absent' | 'late';
}
