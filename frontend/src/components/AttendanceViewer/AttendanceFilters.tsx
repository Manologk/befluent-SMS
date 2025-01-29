import React from 'react';
import { AttendanceFilters, AttendanceStatus, Language } from '../../types/attendance';

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
          <label className="block text-sm font-medium text-gray-700">Level</label>
          <select
            value={filters.level}
            onChange={(e) => handleChange('level', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Elementary">Elementary</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Upper Intermediate">Upper Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Proficient">Proficient</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value as AttendanceStatus | '')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Language</label>
          <select
            value={filters.language}
            onChange={(e) => handleChange('language', e.target.value as Language | '')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All Languages</option>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Italian">Italian</option>
            <option value="Portuguese">Portuguese</option>
            <option value="Russian">Russian</option>
            <option value="Chinese">Chinese</option>
            <option value="Japanese">Japanese</option>
            <option value="Korean">Korean</option>
          </select>
        </div>
      </div>
    </div>
  );
};