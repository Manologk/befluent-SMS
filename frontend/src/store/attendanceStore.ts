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
      student_id: studentId,
      session_id: classId,
      status: 'PRESENT',
      timestamp: new Date().toISOString(),
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
    const classRecords = records.filter(r => r.session_id === classId);
    return {
      total: 3, // This would come from the class roster
      present: classRecords.length
    };
  }
}));