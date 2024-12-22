import React from 'react'
import { Button } from "@/components/ui/button"
import { Student, Teacher, Group, Assignment } from '@/types'

interface ReportGenerationProps {
  students: Student[]
  teachers: Teacher[]
  groups: Group[]
  assignments: Assignment[]
}

// export default function ReportGeneration({ students, teachers, groups, assignments }: ReportGenerationProps) {
//   const generateClassAssignmentReport = () => {
//     const report = assignments.map(assignment => {
//       const teacher = teachers.find(t => t.id === assignment.teacherId)
//       const student = assignment.studentId ? students.find(s => s.id === assignment.studentId) : null
//       const group = assignment.groupId ? groups.find(g => g.id === assignment.groupId) : null

//       return {
//         date: assignment.date,
//         type: assignment.type,
//         teacher: teacher?.name,
//         student: student?.name,
//         group: group?.name,
//       }
//     })

    // console.log('Class Assignment Report:', report)
    // In a real application, you might want to format this report and offer it as a download
//   }

//   const generateTeacherPaymentReport = () => {
//     const report = teachers.map(teacher => {
//       const teacherAssignments = assignments.filter(a => a.teacherId === teacher.id)
//       const privateLessons = teacherAssignments.filter(a => a.type === 'private').length
//       const groupLessons = teacherAssignments.filter(a => a.type === 'group').length
//       const totalPayment = (privateLessons * teacher.rates.private) + (groupLessons * teacher.rates.group)

//       return {
//         teacherName: teacher.name,
//         privateLesson: }
//     }