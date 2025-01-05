import React from 'react';
import { X } from 'lucide-react';
import { AttendanceRecord, AttendanceStatus } from '../../../types/attendance';

interface EditRecordModalProps {
  record: AttendanceRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRecord: AttendanceRecord) => void;
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({
  record,
  isOpen,
  onClose,
  onSave,
}) => {
  const [status, setStatus] = React.useState<AttendanceStatus>(record.status);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...record,
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Edit Attendance Record</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Student</p>
              <p className="mt-1 text-sm text-gray-900">{record.studentName}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(record.date).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};