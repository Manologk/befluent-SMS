import React from 'react';
import { AttendanceStatus } from '../../../types/attendance';

interface StatusFilterProps {
  value: AttendanceStatus | '';
  onChange: (value: AttendanceStatus | '') => void;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  return (
    <div className="flex-1 min-w-[200px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AttendanceStatus | '')}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="">All Status</option>
        <option value="present">Present</option>
        <option value="absent">Absent</option>
        <option value="late">Late</option>
      </select>
    </div>
  );
};