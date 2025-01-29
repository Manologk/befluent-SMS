import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ClassSchedule } from '@/types/attendance';
import { sessionApi } from '@/services/api';
// import { useAttendanceStore } from '@/store/attendanceStore';
import { useToast } from '@/hooks/use-toast';
import { ClassCard } from '@/components/ClassCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const TodaySchedule = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<ClassSchedule[]>([]);
  // const { startScanning } = useAttendanceStore();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        console.log('Fetching sessions for date:', today);
        const data = await sessionApi.getTeacherSessions(today);
        const sortedData = data.sort((a: ClassSchedule, b: ClassSchedule) => {
          const timeA = new Date(`1970/01/01 ${a.time}`).getTime();
          const timeB = new Date(`1970/01/01 ${b.time}`).getTime();
          return timeA - timeB;
        });
        setSessions(sortedData);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        toast({
          title: "Error",
          description: "Failed to fetch today's sessions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [toast]);

  // const handleStartScanning = () => {
  //   startScanning();
  // };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Today's Schedule</h2>
      {sessions.length === 0 ? (
        <div className="text-center text-gray-500">
          No sessions scheduled for today
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((class_) => (
            <ClassCard
              key={class_.id}
              class_={class_}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodaySchedule;