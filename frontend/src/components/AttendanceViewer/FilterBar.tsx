import React from 'react';
import { Search, Filter } from 'lucide-react';
import { AttendanceFilters } from '../../types/attendance';
import { StatusFilter } from '@/components/AttendanceViewer/Filters/StatusFilter';
import { LanguageFilter } from '@/components/AttendanceViewer/Filters/LanguangeFilter';

interface FilterBarProps {
  filters: AttendanceFilters;
  onFilterChange: (filters: AttendanceFilters) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  const handleChange = (field: keyof AttendanceFilters, value: any) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.studentId || ''}
                onChange={(e) => handleChange('studentId', e.target.value || undefined)}
                placeholder="Search by student ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <select
                value={filters.grade || ''}
                onChange={(e) => handleChange('grade', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Grades</option>
                <option value="10A">Grade 10A</option>
                <option value="10B">Grade 10B</option>
              </select>
            </div>

            <StatusFilter 
              value={filters.status || ''}
              onChange={(value) => handleChange('status', value || undefined)}
            />

            <LanguageFilter
              value={filters.language || ''}
              onChange={(value) => handleChange('language', value || undefined)}
            />

            <button className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">More Filters</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Date Range:</span>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="px-3 py-1 border border-gray-200 rounded-md text-sm"
          />
          <span>-</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="px-3 py-1 border border-gray-200 rounded-md text-sm"
          />
        </div>
      </div>
    </div>
  );
};