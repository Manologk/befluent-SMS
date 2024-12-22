import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Group, Student, Teacher } from '@/types'
import { groupApi } from '@/services/api'
import { toast } from '@/hooks/use-toast'

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  maxCapacity: z.number().min(1),
  teacherId: z.string().optional(),
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
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Call the API to create the group
      const data = await groupApi.createGroup(values.name, values.maxCapacity)
      
      // Update the local state with the new group
      setGroups([...groups, data])
      
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
                <FormLabel>Assign Teacher</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Create Group</Button>
        </form>
      </Form>
    </div>
  )
}

