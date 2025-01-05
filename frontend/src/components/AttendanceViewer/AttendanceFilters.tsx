import React from 'react';
import { AttendanceFilters, AttendanceStatus } from '../../types/attendance';

interface AttendanceFiltersProps {
  filters: AttendanceFilters;
  onFilterChange: (filters: AttendanceFilters) => void;
}

export const AttendanceFiltersComponent: React.FC<AttendanceFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const handleChange = (field: keyof AttendanceFilters, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date Range</label>
          <div className="mt-1 flex space-x-2">
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) =>
                handleChange('dateRange', { ...filters.dateRange, start: e.target.value })
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) =>
                handleChange('dateRange', { ...filters.dateRange, end: e.target.value })
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Grade/Class</label>
          <select
            value={filters.grade}
            onChange={(e) => handleChange('grade', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All Grades</option>
            <option value="10A">10A</option>
            <option value="10B">10B</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Student Search</label>
          <input
            type="text"
            value={filters.studentSearch}
            onChange={(e) => handleChange('studentSearch', e.target.value)}
            placeholder="Search by name..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value as AttendanceStatus)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </div>
      </div>
    </div>
  );
};