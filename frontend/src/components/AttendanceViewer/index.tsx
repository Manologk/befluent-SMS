import React, { useState, useEffect, useMemo } from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';
import { Header } from "@/components/AttendanceViewer/Header";
import { StatsCard } from '@/components/AttendanceViewer/StatsCard';
import { FilterBar } from '@/components/AttendanceViewer/FilterBar';
import { DataTable } from '@/components/AttendanceViewer/DataTable';
import { EditRecordModal } from '@/components/AttendanceViewer/Modals/EditRecordModal';
import { AttendanceRecord, AttendanceFilters, AttendanceStatus } from '../../types/attendance';
import { attendanceApi } from '@/services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STUDENT_LEVELS = [
  'all',
  'Beginner',
  'Elementary',
  'Pre-Intermediate',
  'Intermediate',
  'Upper-Intermediate',
  'Advanced'
];

export const AttendanceViewer: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AttendanceFilters>({
    dateRange: { 
      start: format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'), // Last 30 days
      end: format(new Date(), 'yyyy-MM-dd')
    },
    level: '',
    studentSearch: '',
    status: '',
    language: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    console.log('Paginating records:', {
      total: filteredRecords.length,
      currentPage,
      startIndex,
      itemsPerPage,
      pageRecords: filteredRecords.slice(startIndex, startIndex + itemsPerPage)
    });
    return filteredRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching attendance with filters:', filters); // Debug log
      const data = await attendanceApi.getAttendanceLogs({
        dateRange: {
          start: filters.dateRange.start,
          end: filters.dateRange.end
        }
      });
      console.log('Raw attendance data:', data); // Debug log
      if (!Array.isArray(data)) {
        throw new Error('Received invalid data format from API');
      }
      if (data.length === 0) {
        console.log('No attendance records found for the date range');
      }
      setRecords(data);
      setFilteredRecords(data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [filters.dateRange]);

  const handleFilterChange = (key: keyof AttendanceFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSort = (column: 'student' | 'session' | 'status') => {
    const sorted = [...filteredRecords].sort((a, b) => {
      // Get the values to compare based on the column
      let valueA: any;
      let valueB: any;

      switch (column) {
        case 'student':
          valueA = a.student.name;
          valueB = b.student.name;
          break;
        case 'session':
          valueA = new Date(a.session.date).getTime();
          valueB = new Date(b.session.date).getTime();
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        default:
          return 0;
      }

      // Handle null/undefined values
      if (valueA === null || valueA === undefined) return 1;
      if (valueB === null || valueB === undefined) return -1;
      if (valueA === valueB) return 0;

      // Handle string comparisons
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return valueA.localeCompare(valueB);
      }

      // Default comparison
      return valueA < valueB ? -1 : 1;
    });

    setFilteredRecords(sorted);
  };

  const handleExport = () => {
    const csv = [
      ['Student Name', 'Date', 'Status', 'Time In', 'Time Out', 'Notes'].join(','),
      ...filteredRecords.map((record) =>
        [
          record.studentName,
          record.date,
          record.status,
          record.timeIn || '',
          record.timeOut || '',
          record.notes || '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleStatusChange = async (id: string | number, newStatus: AttendanceStatus) => {
    try {
      setLoading(true);
      console.log('Updating status:', { id, newStatus }); // Debug log
      
      const result = await attendanceApi.updateAttendanceStatus(Number(id), {
        status: newStatus
      });
      console.log('API response:', result); // Debug log
      
      // Update the records with the new attendance status
      setRecords(prevRecords => 
        prevRecords.map(record => 
          record.id === id.toString() 
            ? { 
                ...record, 
                status: newStatus,
              } 
            : record
        )
      );

      // Show success message with updated lesson count and balance
      toast.success(
        `Status updated successfully! \nLessons remaining: ${result.lessons_remaining}\nSubscription balance: $${result.subscription_balance.toFixed(2)}`
      );
    } catch (error: any) {
      console.error('Error updating status:', error); // Debug log
      toast.error(error.response?.data?.error || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (data: { status: AttendanceStatus }) => {
    if (selectedRecord) {
      await handleStatusChange(selectedRecord.id, data.status);
      setIsEditModalOpen(false);
    }
  };

  useEffect(() => {
    let filtered = [...records];

    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.session.date);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    if (filters.level) {
      filtered = filtered.filter((record) => (record.student.level || '') === filters.level);
    }

    if (filters.studentSearch) {
      filtered = filtered.filter((record) =>
        record.student.name.toLowerCase().includes(filters.studentSearch.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter((record) => record.status === filters.status);
    }

    if (filters.language) {
      filtered = filtered.filter((record) => record.language === filters.language);
    }

    setFilteredRecords(filtered);
  }, [filters, records]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Loading Attendance Viewer" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Attendance Viewer" />
      
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatsCard
            title="Total Students"
            value={records.length.toString()}
            icon={<Users className="h-6 w-6" />}
            color="text-blue-600"
          />
          <StatsCard
            title="Present"
            value={records.filter(r => r.status === 'present').length.toString()}
            icon={<UserCheck className="h-6 w-6" />}
            color="text-green-600"
          />
          <StatsCard
            title="Absent"
            value={records.filter(r => r.status === 'absent').length.toString()}
            icon={<UserX className="h-6 w-6" />}
            color="text-red-600"
          />
        </div>

        <div className="flex flex-col space-y-6">
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            levels={STUDENT_LEVELS}
            statuses={['all', 'present', 'absent', 'late']}
          />

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <DataTable
              records={paginatedRecords}
              onSort={handleSort}
              onExport={handleExport}
              onPrint={handlePrint}
              onEdit={handleEdit}
            />
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>

        {selectedRecord && (
          <EditRecordModal
            record={selectedRecord}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedRecord(null);
            }}
            onSubmit={handleEditSubmit}
          />
        )}
      </main>
    </div>
  );
};