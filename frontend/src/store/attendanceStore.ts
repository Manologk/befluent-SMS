import { create } from 'zustand';
import { AttendanceRecord } from '@/types/attendance';

interface AttendanceState {
  records: AttendanceRecord[];
  scannedStudents: Set<string>;
  isScanning: boolean;
}

interface AttendanceActions {
  startScanning: () => void;
  stopScanning: () => void;
  markAttendance: (studentId: string, classId: string) => boolean;
  getAttendanceStatus: (classId: string) => { total: number; present: number };
}

export const useAttendanceStore = create<AttendanceState & AttendanceActions>((set, get) => ({
  records: [],
  scannedStudents: new Set(),
  isScanning: false,
  
  startScanning: () => set({ isScanning: true }),
  
  stopScanning: () => set({ isScanning: false }),

  markAttendance: (studentId, classId) => {
    const { records, scannedStudents } = get();
    const key = `${classId}-${studentId}`;
    
    if (scannedStudents.has(key)) {
      return false;
    }

    const newRecord: AttendanceRecord = {
      id: `${Date.now()}`, // Generate a temporary ID
      studentId,
      studentName: '', // This will be updated when synced with backend
      date: new Date().toISOString().split('T')[0],
      status: 'present',
      timeIn: new Date().toISOString(),
      grade: '', // This will be updated when synced with backend
      language: '', // This will be updated when synced with backend
    };

    const newScannedStudents = new Set(scannedStudents);
    newScannedStudents.add(`${studentId}`);

    set({ 
      records: [...records, newRecord],
      scannedStudents: newScannedStudents
    });

    return true;
  },

  getAttendanceStatus: (classId) => {
    const { records } = get();
    const classRecords = records.filter(r => r.studentId === classId);
    return {
      total: 3, // This would come from the class roster
      present: classRecords.length
    };
  }
}));