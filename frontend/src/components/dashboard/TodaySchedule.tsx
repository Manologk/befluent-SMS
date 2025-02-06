import { useState, useEffect } from 'react';
import { ClassSchedule } from '@/types/attendance';
import { ClassCard } from '@/components/ClassCard';
import { useAttendanceStore } from '../../store/attendanceStore';
import { sessionApi } from '@/services/api';
import { format, parse } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import QRScanner from '@/components/QRScanner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const TodaySchedule = () => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<ClassSchedule[]>([]);
  const { startScanning, stopScanning, isScanning } = useAttendanceStore();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        console.log('Fetching sessions for date:', today);
        const data: ClassSchedule[] = await sessionApi.getTeacherSessions(today);
        console.log('Raw sessions data:', data);
        
        // Sort sessions by time
        const sortedData = [...data].sort((a, b) => {
          try {
            // Parse time strings (e.g., "09:00 AM") to Date objects for comparison
            const timeA = parse(a.time, 'hh:mm a', new Date());
            const timeB = parse(b.time, 'hh:mm a', new Date());
            console.log('Comparing times:', {
              a: timeA.toLocaleTimeString(),
              b: timeB.toLocaleTimeString()
            });
            return timeA.getTime() - timeB.getTime();
          } catch (error) {
            console.error('Error sorting sessions:', error);
            return 0;
          }
        });
        
        console.log('Final sorted sessions:', sortedData);
        setSessions(sortedData);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load today\'s sessions. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();

    // Refresh sessions every 5 minutes
    const intervalId = setInterval(fetchSessions, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [toast]);

  const handleStartScanning = (classId: string) => {
    if (!classId) {
      toast({
        title: 'Error',
        description: 'Invalid class selected.',
        variant: 'destructive',
      });
      return;
    }
    
    // Check if the class exists in today's sessions
    const classExists = sessions.some(session => session.id === classId);
    if (!classExists) {
      toast({
        title: 'Error',
        description: 'Selected class not found in today\'s schedule.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedClass(classId);
    startScanning();
  };

  const handleStopScanning = () => {
    setSelectedClass(null);
    stopScanning();
    toast({
      title: 'Scanning Stopped',
      description: 'QR code scanning has been stopped.',
    });
  };

  const handleScanSuccess = async (qrData: string) => {
    try {
      if (!selectedClass) {
        throw new Error('No class selected');
      }

      await sessionApi.markAttendance({
        sessionId: selectedClass,
        studentId: qrData,
      });

      toast({
        title: 'Success',
        description: 'Attendance marked successfully',
      });
      handleStopScanning();
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark attendance. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleScanError = (error: string) => {
    toast({
      title: 'Scanner Error',
      description: error,
      variant: 'destructive',
    });
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

      {isScanning && selectedClass && (
        <Dialog open={true} onOpenChange={() => handleStopScanning()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Scan Student QR Code</DialogTitle>
            </DialogHeader>
            <QRScanner
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TodaySchedule;