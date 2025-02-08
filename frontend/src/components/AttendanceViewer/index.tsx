import React, { useState, useEffect, useMemo } from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';
import { Header } from './Header';
import { StatsCard } from '@/components/AttendanceViewer/StatsCard';
import { FilterBar } from '@/components/AttendanceViewer/FilterBar';
import { DataTable } from '@/components/AttendanceViewer/DataTable';
import { EditRecordModal } from '@/components/AttendanceViewer/Modals/EditRecordModal';
import { AttendanceRecord, AttendanceFilters, AttendanceStatus } from '../../types/attendance';
import { attendanceApi } from '@/services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// const STUDENT_LEVELS = [
//   'all',
//   'Beginner',
//   'Elementary',
//   'Pre-Intermediate',
//   'Intermediate',
//   'Upper-Intermediate',
//   'Advanced'
// ];

export const AttendanceViewer: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AttendanceFilters>({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    studentId: undefined,
    status: undefined,
    language: undefined,
    grade: undefined,
    groupId: undefined
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
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
      const data = await attendanceApi.getAttendanceLogs(
        filters.startDate,
        filters.endDate
      );
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
  }, [filters.startDate, filters.endDate]);

  const handleFilterChange = (newFilters: AttendanceFilters) => {
    setFilters(newFilters);
  };

  const handleSort = (column: keyof AttendanceRecord) => {
    const sorted = [...filteredRecords].sort((a, b) => {
      if (column === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (column === 'studentName' || column === 'grade' || column === 'language') {
        const valueA = a[column]?.toString() || '';
        const valueB = b[column]?.toString() || '';
        return valueA.localeCompare(valueB);
      }
      const valueA = a[column];
      const valueB = b[column];
      
      if (valueA === valueB) return 0;
      if (valueA === undefined || valueA === null) return 1;
      if (valueB === undefined || valueB === null) return -1;
      
      return valueA > valueB ? 1 : -1;
    });
    setFilteredRecords(sorted);
  };

  const handleExport = () => {
    const csv = [
      ['Student Name', 'Student ID', 'Date', 'Status', 'Grade', 'Language'].join(','),
      ...filteredRecords.map((record) => [
        record.studentName,
        record.studentId,
        new Date(record.date).toLocaleDateString(),
        record.status,
        record.grade,
        record.language || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleSaveRecord = async (updatedRecord: AttendanceRecord) => {
    try {
      const newStatus = updatedRecord.status.toLowerCase() as 'present' | 'absent' | 'late';
      const result = await attendanceApi.updateAttendanceStatus(updatedRecord.id, newStatus);
      const updatedRecords = records.map(record =>
        record.id === updatedRecord.id ? updatedRecord : record
      );
      setRecords(updatedRecords);
      setIsEditModalOpen(false);
      setSelectedRecord(null);
      
      toast.success(
        `Status updated successfully! \nLessons remaining: ${result.lessons_remaining}\nSubscription balance: $${result.subscription_balance.toFixed(2)}`
      );
    } catch (err: any) {
      console.error('Error updating record:', err);
      toast.error(err.response?.data?.error || 'Failed to update attendance record');
    }
  };

  const handleEditSubmit = async (data: { status: AttendanceStatus }) => {
    if (selectedRecord) {
      await handleSaveRecord({
        ...selectedRecord,
        status: data.status
      });
    }
  };

  useEffect(() => {
    if (!filters) return;
    
    let filtered = [...records];

    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter((record) => {
        const recordDate = record.date;
        return recordDate >= filters.startDate && recordDate <= filters.endDate;
      });
    }

    if (filters.grade) {
      filtered = filtered.filter((record) => record.grade === filters.grade);
    }

    if (filters.studentId) {
      filtered = filtered.filter((record) => 
        record.studentId.toString().includes(filters.studentId || '')
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
        <Header />
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
      <Header />
      
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
            value={records.filter(r => r.status === 'PRESENT').length.toString()}
            icon={<UserCheck className="h-6 w-6" />}
            color="text-green-600"
          />
          <StatsCard
            title="Absent"
            value={records.filter(r => r.status === 'ABSENT').length.toString()}
            icon={<UserX className="h-6 w-6" />}
            color="text-red-600"
          />
        </div>

        <div className="flex flex-col space-y-6">
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
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