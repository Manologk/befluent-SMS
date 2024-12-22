import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useAttendanceStore } from '@/store/attendanceStore';

interface AttendanceProgressProps {
  classId: string;
}

export const AttendanceProgress: React.FC<AttendanceProgressProps> = ({ classId }) => {
  const getAttendanceStatus = useAttendanceStore(state => state.getAttendanceStatus);
  const { total, present } = getAttendanceStatus(classId);
  const percentage = (present / total) * 100;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <CheckCircle className="w-4 h-4 text-green-500" />
        {present}/{total}
      </div>
    </div>
  );
};