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

    const newRecord = {
      studentId,
      classId,
      timestamp: new Date().toISOString(),
    };

    const newScannedStudents = new Set(scannedStudents);
    newScannedStudents.add(key);

    set({ 
      records: [...records, {
        id: newRecord.studentId + newRecord.timestamp,
        student: {
          id: newRecord.studentId,
          name: 'Student',
        },
        studentName: 'Student',
        session: {
          id: newRecord.classId,
          date: new Date().toISOString().split('T')[0],
          start_time: '00:00',
          end_time: '00:00',
          type: 'GROUP'
        },
        date: new Date().toISOString().split('T')[0],
        timeIn: '00:00',
        timeOut: '00:00',
        scanned_at: newRecord.timestamp,
        valid: true,
        status: 'present'
      }],
      scannedStudents: newScannedStudents
    });

    return true;
  },

  getAttendanceStatus: (classId) => {
    const { records } = get();
    const classRecords = records.filter(r => r.session.id === classId);
    return {
      total: 3, // This would come from the class roster
      present: classRecords.length
    };
  }
}));