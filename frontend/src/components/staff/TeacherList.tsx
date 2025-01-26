"use client"

import React, { useState, useEffect } from 'react'
import { Users, UserPlus, Book, Edit, Eye } from 'lucide-react'
import { teacherApi } from '@/services/api'
import { AddTeacherDialog } from './AddTeacherDialog'
import { EditTeacherDialog } from './EditTeacherDialog'
import { useToast } from '@/hooks/use-toast'

interface Teacher {
  id: string
  name: string
  email: string
  specializations: string[]
  groups?: any[]
  students?: any[]
}

export function TeacherList() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const data = await teacherApi.getAll()
      setTeachers(data)
      setIsLoading(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch teachers",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleAddTeacher = () => {
    setShowAddDialog(true)
  }

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
  }

  const handleViewAssignments = (teacher: Teacher) => {
    // TODO: Implement view assignments functionality
    toast({
      title: "Coming Soon",
      description: "View assignments functionality will be implemented soon",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Staff Management</h2>
        <div className="flex gap-2">
          <button
            onClick={handleAddTeacher}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add New Teacher
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{teacher.name}</h3>
                <p className="text-sm text-gray-500">{teacher.email}</p>
              </div>
              <div className="flex gap-2">
                {teacher.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {teacher.groups?.length || 0} groups
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Book className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {teacher.students?.length || 0} students
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleEditTeacher(teacher)}
                className="flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-700 rounded-md text-sm hover:bg-gray-100"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleViewAssignments(teacher)}
                className="flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-700 rounded-md text-sm hover:bg-gray-100"
              >
                <Eye className="w-4 h-4" />
                View Assignments
              </button>
            </div>
          </div>
        ))}
      </div>

      <AddTeacherDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={fetchTeachers}
      />

      {selectedTeacher && (
        <EditTeacherDialog
          teacher={selectedTeacher}
          open={!!selectedTeacher}
          onOpenChange={(open) => !open && setSelectedTeacher(null)}
          onSuccess={fetchTeachers}
        />
      )}
    </div>
  )
}
