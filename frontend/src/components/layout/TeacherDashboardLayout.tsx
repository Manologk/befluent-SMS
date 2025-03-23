import React, { useEffect, useState } from 'react';
import { Menu, Bell, User, LogOut, Settings, Edit } from 'lucide-react';
import { authApi, teacherApi } from '@/services/api';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAuth } from '@/contexts/AuthContext'; 

interface TeacherInfo {
  name: string;
  email: string;
  specializations: string[];
}

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTeacherInfo = async () => {
      try {
        if (user?.user_id) {
          const data = await teacherApi.getCurrentTeacher(user.user_id.toString());
          setTeacherInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch teacher info:', error);
      }
    };

    fetchTeacherInfo();
  }, [user]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              {/* Add your mobile navigation items here */}
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <h1 className="hidden md:block text-xl font-semibold">Teacher Dashboard</h1>
          </div>

          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{teacherInfo?.name || 'Loading...'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{teacherInfo?.email || 'Loading...'}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {teacherInfo?.specializations && (
                    <>
                      <DropdownMenuLabel className="font-normal">
                        <span className="text-xs text-muted-foreground">
                          Specializations: {teacherInfo.specializations.join(', ')}
                        </span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* Sidebar - Desktop only */}
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="h-full py-6 pl-8 pr-6 lg:py-8">
            {/* Add your sidebar navigation items here */}
          </div>
        </aside>
        
        {/* Main content area */}
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex-1 space-y-4 p-8 pt-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;