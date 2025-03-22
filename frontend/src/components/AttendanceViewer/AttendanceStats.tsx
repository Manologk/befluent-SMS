import React from 'react';
import { AttendanceStats } from '../../types/attendance';

interface AttendanceStatsProps {
  stats: AttendanceStats;
}

export const AttendanceStatsComponent: React.FC<AttendanceStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-sm font-medium text-gray-500">Attendance Rate</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.attendancePercentage}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-sm font-medium text-gray-500">Present Days</div>
              <div className="mt-1 text-3xl font-semibold text-green-600">
                {stats.presentDays}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-sm font-medium text-gray-500">Absent Days</div>
              <div className="mt-1 text-3xl font-semibold text-red-600">
                {stats.absentDays}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-sm font-medium text-gray-500">Late Days</div>
              <div className="mt-1 text-3xl font-semibold text-yellow-600">
                {stats.lateDays}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};