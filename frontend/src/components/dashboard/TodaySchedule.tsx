import React, { useState } from 'react';
import { ClassSchedule } from '../../types/attendance';
import { ClassCard } from "@/components/ClassCard"
import { useAttendanceStore } from '../../store/attendanceStore';

const schedule: ClassSchedule[] = [
  {
    id: '1',
    time: '09:00 AM',
    className: 'Advanced English',
    students: ['Emma Watson', 'John Smith', 'Sarah Parker'],
    type: 'Group',
    isOnline: true,
    proficiencyLevel: 'Advanced',
  },
  {
    id: '2',
    time: '11:00 AM',
    className: 'Business English',
    students: ['Michael Chen'],
    type: 'Private',
    isOnline: false,
    proficiencyLevel: 'Intermediate',
  },
];

const TodaySchedule = () => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const { startScanning, stopScanning, isScanning } = useAttendanceStore();

  const handleStartScanning = (classId: string) => {
    setSelectedClass(classId);
    startScanning();
  };

  const handleStopScanning = () => {
    setSelectedClass(null);
    stopScanning();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Today's Schedule</h2>
      <div className="space-y-4">
        {schedule.map((class_) => (
          <ClassCard
            key={class_.id}
            class_={class_}
            onStartScanning={handleStartScanning}
          />
        ))}
      </div>

      {/* {isScanning && selectedClass && (
        <QRScanner
          classId={selectedClass}
          onClose={handleStopScanning}
        />
      )} */}
    </div>
  );
};

export default TodaySchedule;