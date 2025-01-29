import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Group, Student, Teacher } from '@/types'
import { groupApi, studentApi } from '@/services/api'
import { toast } from '@/hooks/use-toast'
import { AxiosResponse } from 'axios'

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  maxCapacity: z.number().min(1),
  teacherId: z.string().optional(),
  initialStudents: z.array(z.string()).default([]),
})

interface GroupManagementProps {
  groups: Group[]
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>
  students: Student[]
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>
  teachers: Teacher[]
}

export default function GroupManagement({ 
  groups, 
  setGroups, 
  students, 
  setStudents, 
  teachers 
}: GroupManagementProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      maxCapacity: 1,
      initialStudents: [],
    },
  })

  // Fetch students when component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsData = await studentApi.getAll()
        if (Array.isArray(studentsData)) {
          setStudents(studentsData)
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch students",
          variant: "destructive",
        })
      }
    }

    fetchStudents()
  }, [setStudents])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Call the API to create the group
      const response: AxiosResponse<Group> = await groupApi.create({
        name: values.name,
        max_capacity: values.maxCapacity,
        teacher: values.teacherId || "",
        status: "active",
        // language: "English",
        level: "Beginner",
        // initial_students: values.initialStudents
      })
      
      // Extract the group data from the response and update the local state
      const newGroup = response.data
      setGroups([...groups, newGroup])
      
      // Show success message
      toast({
        title: "Success",
        description: "Group created successfully",
      })
      
      // Reset the form
      form.reset()
    } catch (error) {
      // Show error message
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create group",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Group Management</h2>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Total Students: {students.length}
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Name</FormLabel>
                <FormControl>
                  <Input placeholder="Advanced Class" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="maxCapacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Capacity</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => field.onChange(+e.target.value)} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="teacherId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teacher (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="initialStudents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Initial Students</FormLabel>
                <FormControl>
                  <Select 
                    onValueChange={(value) => {
                      const currentValues = field.value || [];
                      if (currentValues.includes(value)) {
                        field.onChange(currentValues.filter(v => v !== value));
                      } else {
                        field.onChange([...currentValues, value]);
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={`Selected Students: ${field.value?.length || 0}`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem 
                          key={student.id} 
                          value={student.id.toString()}
                        >
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Create Group</Button>
        </form>
      </Form>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Current Groups ({groups.length})</h3>
        <div className="space-y-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className="p-4 border rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{group.name}</h4>
                  <p className="text-sm text-gray-500">
                    Capacity: {group.current_capacity}/{group.max_capacity}
                  </p>
                </div>
                {group.teacher && (
                  <div className="text-sm text-gray-500">
                    Teacher: {group.teacher.name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
