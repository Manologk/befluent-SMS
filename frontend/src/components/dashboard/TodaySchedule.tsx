import { useState, useEffect } from 'react';
import { ClassSchedule } from '@/types/attendance';
import { ClassCard } from '@/components/ClassCard';
import { useAttendanceStore } from '../../store/attendanceStore';
import { sessionApi } from '@/services/api';
import { format, parse } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import QRScanner from '@/components/QRScanner';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from "@/components/ui/skeleton";

const TodaySchedule = () => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedClassName, setSelectedClassName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<ClassSchedule[]>([]);
  const { startScanning, stopScanning, isScanning } = useAttendanceStore();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const data: ClassSchedule[] = await sessionApi.getTeacherSessions(today);
        
        // Sort sessions by time
        const sortedData = [...data].sort((a, b) => {
          try {
            const timeA = parse(a.time, 'hh:mm a', new Date());
            const timeB = parse(b.time, 'hh:mm a', new Date());
            return timeA.getTime() - timeB.getTime();
          } catch (error) {
            console.error('Error sorting sessions:', error);
            return 0;
          }
        });
        
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
    
    const selectedSession = sessions.find(session => session.id === classId);
    if (!selectedSession) {
      toast({
        title: 'Error',
        description: 'Selected class not found in today\'s schedule.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedClass(classId);
    setSelectedClassName(selectedSession.className);
    startScanning();
  };

  const handleStopScanning = () => {
    setSelectedClass(null);
    setSelectedClassName("");
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
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>Your classes and sessions for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your classes and sessions for today</CardDescription>
          </div>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No sessions scheduled for today</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {sessions.map((session) => (
                <ClassCard
                  key={session.id}
                  class_={session}
                  onStartScanning={handleStartScanning}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {isScanning && selectedClass && (
        <Dialog open={true} onOpenChange={() => handleStopScanning()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Attendance - {selectedClassName}</DialogTitle>
              <DialogDescription>
                Scan student QR codes to mark attendance for this class. The scanner will close automatically after each successful scan.
              </DialogDescription>
            </DialogHeader>
            <QRScanner
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
            />
            <div className="flex justify-end">
              <Button variant="secondary" onClick={handleStopScanning}>
                Stop Scanning
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default TodaySchedule;