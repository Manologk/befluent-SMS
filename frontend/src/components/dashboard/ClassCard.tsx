import React from "react";
import { Clock, Users, Video, BookOpen, QrCode } from "lucide-react";
import { ClassSchedule } from "@/types/attendance";
import { AttendanceProgress } from "@/components/AttendanceProgress";
import { Button } from "@/components/ui/button";

interface ClassCardProps {
  class_: ClassSchedule;
  onStartScanning: () => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({ class_, onStartScanning }) => {
  return (
    <div className="border rounded-lg p-6 hover:border-blue-500 transition-colors">
      <div className="flex items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <span className="font-medium">{class_.time}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              class_.isOnline
                ? "bg-green-100 text-green-800"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            {class_.isOnline ? "Online" : "In-Person"}
          </span>
        </div>
      </div>

      <h3 className="text-lg font-medium text-gray-800 pb-4">
        {class_.className}
      </h3>

      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Users className="w-5 h-5 text-gray-500 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm text-gray-600">
              {class_.students.length > 0 ? (
                <>
                  {class_.students.length > 3 ? (
                    <>
                      {class_.students.slice(0, 3).join(', ')}
                      <span className="text-gray-500"> +{class_.students.length - 3} more</span>
                    </>
                  ) : (
                    class_.students.join(', ')
                  )}
                </>
              ) : (
                <span className="text-gray-400">No students assigned</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <BookOpen className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">{class_.proficiencyLevel}</span>
        </div>
      </div>

      <div className="py-4">
        <AttendanceProgress classId={class_.id} />
      </div>

      <div className="flex items-center space-x-3 pt-2">
        {class_.isOnline && (
          <button className="inline-flex items-center space-x-2 px-3.5 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors">
            <Video className="w-4 h-4" />
            <span>Join Meeting</span>
          </button>
        )}
        <button className="inline-flex items-center space-x-2 px-3.5 py-2 bg-gray-50 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">
          <BookOpen className="w-4 h-4" />
          <span>View Materials</span>
        </button>

        <Button 
          variant="outline" 
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-green-50 text-green-700 rounded-md text-sm font-medium hover:bg-green-100"
          onClick={onStartScanning}
        >
          <QrCode className="w-4 h-4" />
          <span>Mark Attendance</span>
        </Button>
      </div>
    </div>
  );
};