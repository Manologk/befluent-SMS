
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Sidebar } from '@/components/Sidebar';
import { ThemeSwitcher } from '@/components/theme-swticher';
import { SidebarProvider } from '@/components/SidebarProvider';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import Login from '@/components/pages/Login';
import Dashboard from '@/components/pages/Dashboard';
import { Index as StudentDashboard } from '@/components/pages/StudentPortal';
import StudentManagement from '@/components/pages/StudentManament';
import ParentPortal from '@/components/pages/ParentPortal';
import StaffManagementPage from './components/pages/Staff';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LogoutButton } from './components/LogoutButton';

import { PlanManager } from './components/PlanManager';
import { AttendanceViewer } from './components/AttendanceViewer';

import AcademicPlanning from '@/components/pages/AcademicPlanning'
import UserManagement from './components/pages/UserManagement';

import DashboardLayout from './components/layout/TeacherDashboardLayout';
import TodaySchedule from './components/dashboard/TodaySchedule';
import WeeklyCalendar from './components/dashboard/WeeklyCalendar';
import FinancialOverview from './components/dashboard/FinancialOverview';
import ClassManagement from './components/dashboard/ClassManagement';
import StudentProgress from './components/dashboard/StudentProgress';
// import AdminFunctions from './components/dashboard/AdminFunctions';




import './App.css';

function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      {isAuthenticated && (user?.role as UserRole) === 'student' ? (
        <main className="flex-1">
          <div className="flex justify-end p-4 items-center gap-2">
            <LogoutButton />
            <ThemeSwitcher />
          </div>
          <StudentDashboard />
        </main>
      ) : isAuthenticated && (user?.role as UserRole) === 'instructor' ? (
        <DashboardLayout>
          <div className="flex justify-end p-4 items-center gap-2">
            <LogoutButton />
            <ThemeSwitcher />
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TodaySchedule />
              <FinancialOverview />
            </div>
            <WeeklyCalendar />
            <ClassManagement />
            <StudentProgress />
          </div>
        </DashboardLayout>
      ) : isAuthenticated ? (
        <SidebarProvider>
          <div className="flex min-h-screen flex-col sm:flex-row">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <div className="flex justify-end p-4 items-center gap-2">
                <LogoutButton />
                <ThemeSwitcher />
              </div>
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/students" element={<ProtectedRoute><StudentManagement /></ProtectedRoute>} />
                <Route path="/parents" element={<ProtectedRoute><ParentPortal /></ProtectedRoute>} />
                {/* <Route path="/attendance" element={<ProtectedRoute><AttendanceScanner /></ProtectedRoute>} */}
                <Route path="/attendance" element={<ProtectedRoute><AttendanceViewer /></ProtectedRoute>} />
                <Route path="/staff" element={<ProtectedRoute><StaffManagementPage /></ProtectedRoute>} />
                <Route path="/academic" element={<ProtectedRoute><AcademicPlanning/></ProtectedRoute>} />
                <Route path="/plans" element={<ProtectedRoute><PlanManager/></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><UserManagement/></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </ThemeProvider>
  );
}

export default App;
