import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Teacher } from '@/types'

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
}

export default function TeacherAssignment({ 
  teachers, 
  setTeachers
}: TeacherAssignmentProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contactDetails: "",
    },
  })

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleModal = () => setIsOpen(!isOpen);
  const handleLoading = (loading: boolean) => setIsLoading(loading);

  function onSubmit(values: z.infer<typeof formSchema>) {
    handleLoading(true);
    const newTeacher: Teacher = {
      id: Date.now().toString(),
      name: values.name,
      contactDetails: values.contactDetails,
    }
    setTeachers([...teachers, newTeacher])
    form.reset()
    handleLoading(false);
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Teacher Assignment</h2>
      <button onClick={toggleModal}>Toggle Modal</button>
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
          <Button type="submit" disabled={isLoading}>Register Teacher</Button>
        </form>
      </Form>
    </div>
  )
}
