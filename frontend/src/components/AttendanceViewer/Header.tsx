import { Calendar, Users } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = () => {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Attendance Dashboard</h1>
              <p className="text-sm text-gray-500">Track and manage student attendance</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-green-50 px-3 py-1 rounded-full">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Active Students</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};