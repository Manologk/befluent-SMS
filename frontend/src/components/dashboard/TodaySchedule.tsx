import { useState, useEffect } from 'react';
import { ClassSchedule } from '@/types/attendance';
import { ClassCard } from './ClassCard';
import { useAttendanceStore } from '../../store/attendanceStore';
import { sessionApi } from '@/services/api';
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import AttendanceScanner from '@/components/pages/AttendanceScanner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const TodaySchedule = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<ClassSchedule[]>([]);
  const { startScanning, stopScanning, isScanning } = useAttendanceStore();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        console.log('Fetching sessions for date:', today);
        const data = await sessionApi.getTeacherSessions(today);
        // Sort sessions by start time
        const sortedData = data.sort((a: ClassSchedule, b: ClassSchedule) => {
          return a.time.localeCompare(b.time);
        });
        setSessions(sortedData);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load sessions. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [toast]);

  const handleStartScanning = () => {
    startScanning();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner className="w-8 h-8 text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Today's Schedule</h2>
      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No sessions scheduled for today
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <ClassCard
              key={session.id}
              class_={session}
              onStartScanning={handleStartScanning}
            />
          ))}
        </div>
      )}

      <Dialog open={isScanning} onOpenChange={(open) => !open && stopScanning()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
            <DialogDescription>
              Scan the student's QR code to mark attendance for this class.
            </DialogDescription>
          </DialogHeader>
          {isScanning && <AttendanceScanner />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TodaySchedule;