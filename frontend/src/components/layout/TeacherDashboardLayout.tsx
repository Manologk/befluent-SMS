import React, { useEffect, useState } from 'react';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { authApi, teacherApi } from '@/services/api';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useAuth } from '@/contexts/AuthContext';

interface TeacherInfo {
  name: string;
  email: string;
  specializations: string[];
}

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTeacherInfo = async () => {
      try {
        // Only fetch if we have a user_id
        if (user?.user_id) {
          console.log('Fetching teacher info for user_id:', user.user_id);
          const data = await teacherApi.getCurrentTeacher(user.user_id.toString());
          console.log('Received teacher data:', data);
          setTeacherInfo(data);
        } else {
          console.log('No user_id available:', user);
        }
      } catch (error) {
        console.error('Failed to fetch teacher info:', error);
      }
    };

    fetchTeacherInfo();
  }, [user]); // Add user as a dependency so it refetches when user changes

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Teacher Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="p-2 rounded-lg hover:bg-gray-100">
                  <User className="w-6 h-6 text-gray-600" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-gray-100 p-2">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">{teacherInfo?.name || 'Loading...'}</h4>
                      <p className="text-sm text-gray-500">{teacherInfo?.email || 'Loading...'}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {teacherInfo?.specializations && (
                      <p>Specializations: {teacherInfo.specializations.join(', ')}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                      Edit Info
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                      Settings
                    </button>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
            
            <button 
              className="p-2 rounded-lg hover:bg-gray-100"
              onClick={async () => {
                try {
                  await authApi.logout();
                  window.location.href = '/login';
                } catch (error) {
                  console.error('Logout failed:', error);
                }
              }}
            >
              <LogOut className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;