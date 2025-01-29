// import React from 'react';
import { QRCodeSection } from '@/components/QrCodeSection';
import { LessonSchedule } from '@/components/LessonSchedule';
import { LessonStatistics } from '@/components/LessonStatistics';
import { ProfileIcon } from '@/components/ProfileIcon';

export function Index() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <ProfileIcon />
      </div>
      <div className="space-y-8">
        <QRCodeSection />
        <LessonSchedule />
        <LessonStatistics />
      </div>
    </div>
  );
}

