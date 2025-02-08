import React from "react";
import { Clock, Users, Video, BookOpen, QrCode } from "lucide-react";
import { ClassSchedule } from "@/types/attendance";
import { useClassActivity } from "@/hooks/useClassActivity";
import { AttendanceProgress } from "./AttendanceProgress";
import { Button } from "@/components/ui/button";

interface ClassCardProps {
  class_: ClassSchedule;
  onStartScanning: (classId: string) => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  class_,
  onStartScanning,
}) => {
  const isActive = useClassActivity(class_.time);

  const handleStartScanning = () => {
    onStartScanning(class_.id);
  };

  return (
    <div className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <span className="font-medium">{class_.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              class_.isOnline
                ? "bg-green-100 text-green-800"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            {class_.isOnline ? "Online" : "In-Person"}
          </span>
          {isActive && (
            <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Active
            </span>
          )}
        </div>
      </div>

      <h3 className="text-lg font-medium text-gray-800 mb-2">
        {class_.className}
      </h3>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-gray-500" />
          <div className="flex flex-col">
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
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-gray-500" />
          <span className="text-sm">{class_.proficiencyLevel}</span>
        </div>
      </div>

      <div className="mt-4">
        <AttendanceProgress classId={class_.id} />
      </div>

      <div className="mt-4 flex gap-2">
        {class_.isOnline && (
          <button className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm hover:bg-blue-100">
            <Video className="w-4 h-4" />
            Join Meeting
          </button>
        )}
        <button className="flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-700 rounded-md text-sm hover:bg-gray-100">
          <BookOpen className="w-4 h-4" />
          View Materials
        </button>

        <Button 
          variant="outline" 
          className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-md text-sm hover:bg-green-100"
          onClick={handleStartScanning}
        >
          <QrCode className="w-4 h-4" />Mark Attendance
        </Button>
      </div>
    </div>
  );
};
