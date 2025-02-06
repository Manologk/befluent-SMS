import React from 'react';
import { ArrowUpDown, MoreHorizontal, FileDown, Printer } from 'lucide-react';
import { AttendanceRecord, AttendanceStatus } from '../../types/attendance';

interface DataTableProps {
  records: AttendanceRecord[];
  onSort: (column: keyof AttendanceRecord) => void;
  onExport: () => void;
  onPrint: () => void;
  onEdit: (record: AttendanceRecord) => void;
}

const getStatusStyle = (status: AttendanceStatus): string => {
  const styles: Record<AttendanceStatus, string> = {
    PRESENT: 'bg-green-50 text-green-700 border-green-200',
    ABSENT: 'bg-red-50 text-red-700 border-red-200',
    LATE: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    EXCUSED: 'bg-blue-50 text-blue-700 border-blue-200'
  };
  return `${styles[status]} px-2 py-1 text-xs font-medium rounded-full border`;
};

export const DataTable: React.FC<DataTableProps> = ({
  records,
  onSort,
  onExport,
  onPrint,
  onEdit,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Attendance Records</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onExport}
              className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={onPrint}
              className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th scope="col" className="px-6 py-3 text-left">
                <button
                  onClick={() => onSort('student_id')}
                  className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Student
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left">
                <button
                  onClick={() => onSort('timestamp')}
                  className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {record.student?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {record.student?.name || 'Unknown Student'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Session ID: {record.session_id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(record.timestamp).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={getStatusStyle(record.status)}>
                    {record.status.charAt(0) + record.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(record.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {record.notes || '-'}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(record)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {records.length} records
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};