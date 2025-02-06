import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AttendanceRecord, AttendanceStatus } from '../../../types/attendance';
// import { attendanceApi } from '../../../services/api';
import toast from 'react-hot-toast';

interface EditRecordModalProps {
  record: AttendanceRecord;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { status: AttendanceStatus }) => Promise<void>;
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({
  record,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [status, setStatus] = useState<AttendanceStatus>(record.status);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSubmit({ status });
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    } finally {
      setLoading(false);
    }
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
              disabled={loading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Student</p>
              <p className="mt-1 text-sm text-gray-900">{record.student?.name || 'Unknown Student'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(record.timestamp).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Current Status</p>
              <p className="mt-1 text-sm text-gray-900 capitalize">{record.status.toLowerCase()}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={loading}
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
              </select>
            </div>

            {status !== record.status && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-700">
                  {status === 'PRESENT' && record.status === 'ABSENT' ? (
                    <span>
                      Changing status to Present will deduct 1 lesson and update the subscription balance.
                    </span>
                  ) : status === 'ABSENT' && record.status === 'PRESENT' ? (
                    <span>
                      Changing status to Absent will add back 1 lesson and update the subscription balance.
                    </span>
                  ) : null}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};