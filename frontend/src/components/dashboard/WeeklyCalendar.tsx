import React from 'react';
import { Calendar, Clock } from 'lucide-react';

const WeeklyCalendar = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 8 PM

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Weekly Calendar</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            Previous Week
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
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
            {days.map((day) => (
              <div
                key={day}
                className="h-12 flex items-center justify-center font-medium text-gray-800 bg-gray-50 rounded-lg"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 gap-2 mb-2">
              <div className="flex items-center justify-center text-sm text-gray-500">
                {`${hour}:00`}
              </div>
              {days.map((day, index) => (
                <div
                  key={`${day}-${hour}`}
                  className="h-16 border border-gray-100 rounded-lg hover:border-blue-500 transition-colors p-1"
                >
                  {/* Example class block */}
                  {hour === 9 && index === 0 && (
                    <div className="h-full bg-blue-100 text-blue-800 rounded p-1 text-xs">
                      Advanced English
                    </div>
                  )}
                  {hour === 11 && index === 2 && (
                    <div className="h-full bg-purple-100 text-purple-800 rounded p-1 text-xs">
                      Business English
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;