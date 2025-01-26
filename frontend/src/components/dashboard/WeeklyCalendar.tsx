import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, parseISO } from 'date-fns';
import { sessionApi } from '@/services/api';

interface Session {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  type: 'GROUP' | 'PRIVATE';
  status: string;
  teacher: number;
  student?: number;
  group?: number;
  student_name?: string;
  group_name?: string;
}

const WeeklyCalendar = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

  // Get dates for the current week
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start week on Monday
    return addDays(weekStart, i);
  });

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // Fetch sessions for each day of the week
        const sessionsPromises = weekDates.map(date =>
          sessionApi.getSessionsByDate(format(date, 'yyyy-MM-dd'))
        );
        
        const responses = await Promise.all(sessionsPromises);
        const allSessions = responses.flat();
        setSessions(allSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessions();
  }, [currentWeek]); // Refetch when week changes

  const handlePreviousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  };

  const getSessionsForTimeSlot = (date: Date, hour: number) => {
    return sessions.filter(session => {
      const sessionDate = format(parseISO(session.date), 'yyyy-MM-dd');
      const currentDate = format(date, 'yyyy-MM-dd');
      const sessionHour = parseInt(session.start_time.split(':')[0]);
      return sessionDate === currentDate && sessionHour === hour;
    });
  };

  const getSessionDisplayName = (session: Session) => {
    if (session.type === 'PRIVATE' && session.student_name) {
      return session.student_name;
    }
    if (session.type === 'GROUP' && session.group_name) {
      return session.group_name;
    }
    return session.type;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Week of {format(weekDates[0], 'MMM d, yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePreviousWeek}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Previous Week
          </button>
          <button
            onClick={handleNextWeek}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Next Week
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Calendar Header */}
          <div className="grid grid-cols-8 gap-2 mb-4">
            <div className="h-12 flex items-center justify-center font-medium text-gray-500">
              <Clock className="w-5 h-5" />
            </div>
            {weekDates.map((date, index) => (
              <div
                key={index}
                className="h-12 flex flex-col items-center justify-center font-medium text-gray-800 bg-gray-50 rounded-lg"
              >
                <span>{days[index]}</span>
                <span className="text-sm text-gray-500">
                  {format(date, 'MMM d')}
                </span>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 gap-2 mb-2">
              <div className="flex items-center justify-center text-sm text-gray-500">
                {`${hour}:00`}
              </div>
              {weekDates.map((date, index) => {
                const daysSessions = getSessionsForTimeSlot(date, hour);
                return (
                  <div
                    key={`${index}-${hour}`}
                    className="h-16 border border-gray-100 rounded-lg hover:border-blue-500 transition-colors p-1"
                  >
                    {daysSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`h-full ${
                          session.type === 'PRIVATE'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        } rounded p-1 text-xs`}
                      >
                        <div className="font-medium">{getSessionDisplayName(session)}</div>
                        <div className="text-xs opacity-75">
                          {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;