import { AttendanceRecord, Student, Language } from '../types/attendance';

export const mockStudents: Student[] = [
  { id: '1', name: 'Alice Johnson', grade: '10A', language: 'english' },
  { id: '2', name: 'Bob Smith', grade: '10A', language: 'spanish' },
  { id: '3', name: 'Carol Williams', grade: '10B', language: 'french' },
  { id: '4', name: 'David Brown', grade: '10B', language: 'mandarin' },
];

export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'Alice Johnson',
    date: '2024-03-10',
    status: 'present',
    timeIn: '08:00',
    timeOut: '15:00',
    grade: '10A',
    language: 'english'
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'Bob Smith',
    date: '2024-03-10',
    status: 'late',
    timeIn: '08:30',
    timeOut: '15:00',
    notes: 'Traffic delay',
    grade: '10A',
    language: 'spanish'
  },
  {
    id: '3',
    studentId: '3',
    studentName: 'Carol Williams',
    date: '2024-03-10',
    status: 'absent',
    notes: 'Medical appointment',
    grade: '10B',
    language: 'french'
  },
  {
    id: '4',
    studentId: '4',
    studentName: 'David Brown',
    date: '2024-03-10',
    status: 'present',
    timeIn: '08:00',
    timeOut: '15:00',
    grade: '10B',
    language: 'mandarin'
  }
];