import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StudentRegistration from '@/components/StudentRegistration'
import TeacherAssignment from '@/components/TeacherAssignment'
import GroupManagement from '@/components/GroupManagement'
// import ReportGeneration from '@/components/ReportGeneration'
import CreateSchedule from '@/components/CreateSchedule'
import { Student, Teacher, Group, Assignment } from '@/types'

export default function ClassManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Class Management System</h1>
      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="schedule">Create Schedule</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <StudentRegistration 
            students={students} 
            setStudents={setStudents} 
            groups={groups}
          />
        </TabsContent>
        <TabsContent value="teachers">
          <TeacherAssignment 
            teachers={teachers} 
            setTeachers={setTeachers}
            students={students}
            groups={groups}
            assignments={assignments}
            setAssignments={setAssignments}
          />
        </TabsContent>
        <TabsContent value="groups">
          <GroupManagement 
            groups={groups} 
            setGroups={setGroups}
            students={students}
            setStudents={setStudents}
            teachers={teachers}
          />
        </TabsContent>
        <TabsContent value="schedule">
          <CreateSchedule 
            students={students}
            teachers={teachers}
            groups={groups}
            assignments={assignments}
            setAssignments={setAssignments}
          />
        </TabsContent>
        <TabsContent value="reports">
          {/* <ReportGeneration 
            students={students}
            teachers={teachers}
            groups={groups}
            assignments={assignments}
          /> */}
        </TabsContent>
      </Tabs>
    </div>
  )
}

