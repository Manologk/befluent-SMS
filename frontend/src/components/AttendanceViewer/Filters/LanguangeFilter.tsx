import React from 'react';
import { Language } from '../../../types/attendance';

interface LanguageFilterProps {
  value: Language | '';
  onChange: (value: Language | '') => void;
}

export const LanguageFilter: React.FC<LanguageFilterProps> = ({ value, onChange }) => {
  return (
    <div className="flex-1 min-w-[200px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Language | '')}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="">All Languages</option>
        <option value="english">English</option>
        <option value="spanish">Spanish</option>
        <option value="french">French</option>
        <option value="mandarin">Mandarin</option>
        <option value="arabic">Arabic</option>
      </select>
    </div>
  );
};