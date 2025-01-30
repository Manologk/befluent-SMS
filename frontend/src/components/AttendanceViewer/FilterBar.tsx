import React from 'react';
import { Search, Filter } from 'lucide-react';
import { AttendanceFilters } from '@/types/attendance';
import { StatusFilter } from '@/components/AttendanceViewer/Filters/StatusFilter';
import { DateRangeFilter } from '@/components/AttendanceViewer/Filters/DateRangeFilter';

interface FilterBarProps {
  filters: AttendanceFilters;
  onFilterChange: (key: keyof AttendanceFilters, value: any) => void;
  levels: string[];
  statuses: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, levels }) => {
  const handleChange = (field: keyof AttendanceFilters, value: any) => {
    onFilterChange(field, value);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="space-y-4">
        <DateRangeFilter
          startDate={filters.dateRange.start}
          endDate={filters.dateRange.end}
          onStartDateChange={(date) => handleChange('dateRange', { ...filters.dateRange, start: date })}
          onEndDateChange={(date) => handleChange('dateRange', { ...filters.dateRange, end: date })}
        />

        <div className="relative">
          <input
            type="text"
            value={filters.studentSearch}
            onChange={(e) => handleChange('studentSearch', e.target.value)}
            placeholder="Search students..."
            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex-1 min-w-[200px]">
            <select
              value={filters.level}
              onChange={(e) => handleChange('level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Levels</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <StatusFilter
            value={filters.status}
            onChange={(value) => handleChange('status', value)}
          />

          <div className="flex-1 min-w-[200px]">
            <select
              value={filters.language}
              onChange={(e) => handleChange('language', e.target.value as string)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="Group">Group</option>
              <option value="Private">Private</option>
            </select>
          </div>

          <button className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2 text-gray-500" />
            <span>More Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};