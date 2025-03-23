import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { scheduleApi, studentApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfWeek, addDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Session {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  type: string;
  subject: string | null;
  teacher_details: {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    specializations: string[];
  };
  group?: {
    name: string;
  };
}

interface StudentData {
  id: number;
  user_id: number;
  name: string;
  email: string;
}

const ScheduleCard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [studentData, setStudentData] = useState<StudentData>();
  const { user } = useAuth();

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user?.user_id) {
        console.log('No user ID found:', user);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // First get the student data
        console.log('Fetching student data for user ID:', user.user_id);
        const studentResponse = await studentApi.getById(user.user_id);
        console.log('Student data received:', studentResponse.data);
        
        if (!studentResponse.data) {
          throw new Error('No student data received');
        }
        
        setStudentData(studentResponse.data);
        
        // Get the current week's start (Sunday) and end (Saturday)
        const today = new Date();
        const weekStart = startOfWeek(today);
        const weekEnd = addDays(weekStart, 6);
        
        console.log('Fetching schedule for week:', {
          studentId: studentResponse.data.id,
          weekStart: format(weekStart, 'yyyy-MM-dd'),
          weekEnd: format(weekEnd, 'yyyy-MM-dd')
        });
        
        // Get sessions for the entire week using student ID
        const data = await scheduleApi.getWeeklySchedule(
          `${format(weekStart, 'yyyy-MM-dd')},${format(weekEnd, 'yyyy-MM-dd')}`,
          studentResponse.data.id.toString()
        );
        
        console.log('Raw schedule data received:', data);
        
        if (Array.isArray(data)) {
          // Sort sessions by date and time
          const sortedData = data.sort((a, b) => {
            const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
            if (dateCompare === 0) {
              return a.start_time.localeCompare(b.start_time);
            }
            return dateCompare;
          });
          
          setSessions(sortedData);
          console.log('Processed sessions:', sortedData.map(session => ({
            id: session.id,
            date: session.date,
            time: `${session.start_time} - ${session.end_time}`,
            type: session.type,
            teacher: session.teacher_details?.name,
            group: session.group?.name
          })));
        } else {
          console.error('Unexpected data format:', data);
          setError('Invalid schedule data format received');
        }
      } catch (err) {
        console.error('Error fetching schedule:', err);
        if (err instanceof Error) {
          console.error('Error details:', {
            message: err.message,
            stack: err.stack
          });
        }
        setError('Failed to load schedule. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [user?.user_id]);

  // Log whenever sessions state changes
  useEffect(() => {
    console.log('Sessions state updated:', {
      count: sessions.length,
      sessions: sessions.map(session => ({
        day: format(new Date(session.date), 'EEEE'),
        class: session.group ? session.group.name : session.type,
        time: session.start_time
      }))
    });
  }, [sessions]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Class Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-12 w-2/3" />
                <Skeleton className="h-12 w-1/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Class Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Group sessions by day and limit to 3 days
  const sessionsByDay = Object.entries(
    sessions.reduce((acc, session) => {
      const day = format(new Date(session.date), 'EEEE');
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(session);
      return acc;
    }, {} as Record<string, Session[]>)
  )
    .sort(([dayA], [dayB]) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days.indexOf(dayA) - days.indexOf(dayB);
    })
    .slice(0, 3) // Limit to 3 days
    .reduce<Record<string, Session[]>>((obj, [key, value]) => ({ ...obj, [key]: value }), {});

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Class Schedule
        </CardTitle>
      </CardHeader>
      {/* Add scrollbar-thin for a sleek scrollbar */}
      {/* scrollbar-thumb-primary/10 for a subtle thumb color */}
      {/* hover:scrollbar-thumb-primary/20 for slightly darker on hover */}
      <CardContent>
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent hover:scrollbar-thumb-primary/20">
          {Object.entries(sessionsByDay).map(([day, daySessions]) => (
            <div
              key={day}
              className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <p className="font-medium text-sm text-muted-foreground mb-2">{day}</p>
              {daySessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between py-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {session.group ? session.group.name : session.type}
                      </p>
                      {session.subject && (
                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                          {session.subject}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      with {session.teacher_details?.name || 'Unassigned'}
                    </p>
                  </div>
                  <p className="text-primary font-medium">
                    {format(new Date(`2000-01-01T${session.start_time}`), 'h:mm a')}
                  </p>
                </div>
              ))}
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No classes scheduled for this week
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleCard;