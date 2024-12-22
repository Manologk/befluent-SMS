import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Teacher, Student, Group, Assignment } from '@/types'

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  contactDetails: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

interface TeacherAssignmentProps {
  teachers: Teacher[]
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>
  students: Student[]
  groups: Group[]
  assignments: Assignment[]
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>
}

export default function TeacherAssignment({ 
  teachers, 
  setTeachers, 
  students, 
  groups, 
  assignments, 
  setAssignments 
}: TeacherAssignmentProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contactDetails: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newTeacher: Teacher = {
      id: Date.now().toString(),
      name: values.name,
      contactDetails: values.contactDetails,
    }
    setTeachers([...teachers, newTeacher])
    form.reset()
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Teacher Assignment</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="jane@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Register Teacher</Button>
        </form>
      </Form>
    </div>
  )
}

