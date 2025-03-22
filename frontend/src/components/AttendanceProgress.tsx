import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { sessionApi } from '@/services/api';

interface AttendanceProgressProps {
  classId: string;
}

export const AttendanceProgress = ({ classId }: AttendanceProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [present, setPresent] = useState(0);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await sessionApi.getAttendance(classId);
        const presentCount = data.filter((record: any) => record.status === 'present').length;
        const totalCount = data.length;
        setPresent(presentCount);
        setTotal(totalCount);
        setProgress(totalCount > 0 ? (presentCount / totalCount) * 100 : 0);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };

    fetchAttendance();
  }, [classId]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-500">
        <span>Attendance</span>
        <span>{present}/{total} present</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};