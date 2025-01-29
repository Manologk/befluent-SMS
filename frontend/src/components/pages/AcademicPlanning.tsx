// Import necessary dependencies and components
import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import StudentRegistration from '@/components/StudentRegistration'
// import TeacherAssignment from '@/components/TeacherAssignment'
import GroupManagement from '@/components/GroupManager/GroupManagement'
// import ReportGeneration from '@/components/ReportGeneration'  // Currently disabled
import CreateSchedule from '@/components/CreateSchedule'
import { Student, Teacher, Assignment, Group } from '@/types'
import { studentApi, groupApi } from '@/services/api'
import { useToast } from "@/hooks/use-toast"

// Main component for managing academic planning and class management
export default function ClassManagement() {
  // State management using React hooks
  // These states store the main data structures used across the application
  const [students, setStudents] = useState<Student[]>([])      // List of all students
  const [teachers, setTeachers] = useState<Teacher[]>([])      // List of all teachers
  const [groups, setGroups] = useState<Group[]>([])           // List of all study groups
  const [assignments, setAssignments] = useState<Assignment[]>([])  // List of teacher-student assignments
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Fetch students and groups data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch students
        const studentsData = await studentApi.getAll()
        if (Array.isArray(studentsData)) {
          setStudents(studentsData)
        }

        // Fetch groups
        const groupsData = await groupApi.getAll()
        if (Array.isArray(groupsData)) {
          setGroups(groupsData)
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load data. Please try again later.",
          variant: "destructive",
        })
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, []) // Empty dependency array means this runs once on mount

  return (
    // Main container with responsive padding and margin
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Class Management System</h1>
      
      {/* Tab system for navigation between different sections */}
      <Tabs defaultValue="groups">
        {/* Tab navigation buttons */}
        <TabsList>
          {/* Group management tab - Active */}
          <TabsTrigger value="groups">Groups</TabsTrigger>
          
          {/* Schedule creation tab - Active */}
          <TabsTrigger value="schedule">Create Schedule</TabsTrigger>
          
          {/* Reports tab - Active but content disabled */}
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Group Management tab content - Active */}
        <TabsContent value="groups">
          <GroupManagement />
        </TabsContent>

        {/* Schedule Creation tab content - Active */}
        <TabsContent value="schedule">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <CreateSchedule 
              students={students}
              teachers={teachers}
              groups={groups}
              assignments={assignments}
              setTeachers={setTeachers}
              setAssignments={setAssignments}
            />
          )}
        </TabsContent>

        {/* Reports tab content - Currently disabled */}
        <TabsContent value="reports">
          {/* <ReportGeneration /> */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
