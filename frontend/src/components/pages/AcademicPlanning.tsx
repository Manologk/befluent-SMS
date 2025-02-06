import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GroupManagement from '@/components/GroupManager/GroupManagement'
// import ReportGeneration from '@/components/ReportGeneration'
import CreateSchedule from '@/components/CreateSchedule'
import { Assignment } from '@/types'

export default function ClassManagement() {
  const [assignments, setAssignments] = useState<Assignment[]>([])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Class Management System</h1>
      <Tabs defaultValue="groups">
        <TabsList>
          {/* <TabsTrigger value="students">Students</TabsTrigger> */}
          {/* <TabsTrigger value="teachers">Teachers</TabsTrigger> */}
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="schedule">Create Schedule</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        {/* <TabsContent value="students">
          <StudentRegistration 
            students={students} 
            setStudents={setStudents} 
            groups={groups}
          />
        </TabsContent> */}
        {/* <TabsContent value="teachers">
          <TeacherAssignment 
            teachers={teachers} 
            setTeachers={setTeachers}
            students={students}
            groups={groups}
            assignments={assignments}
            setAssignments={setAssignments}
          />
        </TabsContent> */}
        <TabsContent value="groups">
          <GroupManagement />
        </TabsContent>
        <TabsContent value="schedule">
          <CreateSchedule 
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
