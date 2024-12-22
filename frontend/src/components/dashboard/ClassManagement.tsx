import React from 'react';
import { Users, UserPlus, MessageSquare, FileText, AlertCircle } from 'lucide-react';

const ClassManagement = () => {
  const classes = [
    {
      id: 1,
      name: 'Advanced English',
      type: 'Group',
      schedule: 'Mon, Wed, Fri 9:00 AM',
      students: 5,
      hasSubstituteRequest: false,
      notes: 'Focus on business presentations next week'
    },
    {
      id: 2,
      name: 'Business English',
      type: 'Private',
      schedule: 'Tue, Thu 11:00 AM',
      students: 1,
      hasSubstituteRequest: true,
      notes: 'Student requested more focus on email writing'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Class Management</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add New Class
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {classes.map((class_) => (
          <div key={class_.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{class_.name}</h3>
                <p className="text-sm text-gray-500">{class_.schedule}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                class_.type === 'Group' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {class_.type}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {class_.students} student{class_.students > 1 ? 's' : ''}
                </span>
              </div>
              {class_.hasSubstituteRequest && (
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Substitute requested</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Class Notes</span>
              </div>
              <p className="text-sm text-gray-600 pl-6">{class_.notes}</p>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-700 rounded-md text-sm hover:bg-gray-100">
                <MessageSquare className="w-4 h-4" />
                Add Note
              </button>
              <button className="flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-700 rounded-md text-sm hover:bg-gray-100">
                <Users className="w-4 h-4" />
                Request Substitute
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassManagement;