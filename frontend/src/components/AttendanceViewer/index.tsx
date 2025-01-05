import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { Header } from './Header';
import { StatsCard } from '@/components/AttendanceViewer/StatsCard';
import { FilterBar } from '@/components/AttendanceViewer/FilterBar';
import { DataTable } from '@/components/AttendanceViewer/DataTable';
import { EditRecordModal } from '@/components/AttendanceViewer/Modals/EditRecordModal';
import { AttendanceRecord, AttendanceFilters } from '../../types/attendance';
import { mockAttendanceRecords } from '../../data/mockData';

export const AttendanceViewer: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>(records);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filters, setFilters] = useState<AttendanceFilters>({
    dateRange: { start: '', end: '' },
    grade: '',
    studentSearch: '',
    status: '',
    language: '',
  });

  const stats = {
    total: records.length,
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
  };

  const handleFilterChange = (newFilters: AttendanceFilters) => {
    setFilters(newFilters);
  };

  const handleSort = (column: keyof AttendanceRecord) => {
    const sorted = [...filteredRecords].sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];
      
      if (valueA === valueB) return 0;
      if (valueA === null || valueA === undefined) return 1;
      if (valueB === null || valueB === undefined) return -1;
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

  const handleSaveRecord = (updatedRecord: AttendanceRecord) => {
    const updatedRecords = records.map(record =>
      record.id === updatedRecord.id ? updatedRecord : record
    );
    setRecords(updatedRecords);
  };

  useEffect(() => {
    let filtered = [...records];

    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(
        (record) =>
          record.date >= filters.dateRange.start && record.date <= filters.dateRange.end
      );
    }

    if (filters.grade) {
      filtered = filtered.filter((record) => record.grade === filters.grade);
    }

    if (filters.studentSearch) {
      filtered = filtered.filter((record) =>
        record.studentName.toLowerCase().includes(filters.studentSearch.toLowerCase())
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Students"
            value={stats.total}
            icon={Users}
            color="text-indigo-600"
            subtitle="Active today"
          />
          <StatsCard
            title="Present"
            value={stats.present}
            icon={UserCheck}
            color="text-green-600"
            subtitle={`${Math.round((stats.present / stats.total) * 100)}% attendance`}
          />
          <StatsCard
            title="Absent"
            value={stats.absent}
            icon={UserX}
            color="text-red-600"
          />
          <StatsCard
            title="Late"
            value={stats.late}
            icon={Clock}
            color="text-yellow-600"
          />
        </div>

        <div className="space-y-6">
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          <DataTable
            records={filteredRecords}
            onSort={handleSort}
            onExport={handleExport}
            onPrint={handlePrint}
            onEdit={handleEdit}
          />
        </div>
      </main>

      {selectedRecord && (
        <EditRecordModal
          record={selectedRecord}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRecord(null);
          }}
          onSave={handleSaveRecord}
        />
      )}
    </div>
  );
};