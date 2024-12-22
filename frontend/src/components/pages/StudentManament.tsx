import React from 'react';
import { StudentList } from "@/components/StudentList";
import { AddStudentForm } from "@/components/add-student-form";

export default function StudentManagement() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Student Management</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <StudentList className="md:col-span-2 lg:col-span-5" />
        <AddStudentForm className="md:col-span-2 lg:col-span-2" />
      </div>
    </div>
  );
}

