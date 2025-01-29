// import React from 'react';
import { Calendar, FileText, MessageSquare, Upload, Clock } from 'lucide-react';

const AdminFunctions = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Administrative Functions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Leave Request */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-800">Leave Request</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                className="w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              Submit Request
            </button>
          </div>
        </div>

        {/* Availability Calendar */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-gray-800">Update Availability</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
              Open Calendar
            </button>
            <p className="text-sm text-gray-600">
              Last updated: March 15, 2024
            </p>
          </div>
        </div>

        {/* Document Upload */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-purple-600" />
            <h3 className="font-medium text-gray-800">Document Upload</h3>
          </div>
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">
                Drag and drop files here or click to browse
              </p>
            </div>
            <button className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700">
              Upload Files
            </button>
          </div>
        </div>

        {/* Teaching Resources */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-orange-600" />
            <h3 className="font-medium text-gray-800">Teaching Resources</h3>
          </div>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 text-left">
              Lesson Plans
            </button>
            <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 text-left">
              Teaching Materials
            </button>
            <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 text-left">
              Assessment Templates
            </button>
          </div>
        </div>

        {/* Communication Portal */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="font-medium text-gray-800">Communication Portal</h3>
          </div>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 text-left">
              Message Administration
            </button>
            <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 text-left">
              View Announcements
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFunctions;