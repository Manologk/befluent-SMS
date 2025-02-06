"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { studentApi, parentApi } from "@/services/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Parent {
  id: number
  name: string
  email: string
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  level: z.string(),
  lessons_remaining: z.coerce.number().min(0),
  subscription_balance: z.coerce.number().min(0),
  parentId: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface EditStudentDialogProps {
  student: {
    id: string
    name: string
    email: string
    level: string
    lessons_remaining: number
    subscription_balance: number
    parent_id?: number
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditStudentDialog({ student, open, onOpenChange, onSuccess }: EditStudentDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [parents, setParents] = React.useState<Parent[]>([])
  const [linkedParent, setLinkedParent] = React.useState<any>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: student.name,
      email: student.email,
      level: student.level,
      lessons_remaining: student.lessons_remaining,
      subscription_balance: student.subscription_balance,
      parentId: student.parent_id ? student.parent_id.toString() : "none",
    },
  })

  React.useEffect(() => {
    form.reset({
      name: student.name,
      email: student.email,
      level: student.level,
      lessons_remaining: student.lessons_remaining,
      subscription_balance: student.subscription_balance,
      parentId: student.parent_id ? student.parent_id.toString() : "none",
    })
  }, [student, form])

  // Fetch parents when dialog opens
  React.useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          // Fetch all parents
          const parentsData = await parentApi.getAll()
          setParents(parentsData)

          // Fetch linked parent for this student
          if (student?.id) {
            const link = await parentApi.getStudentParentLink(parseInt(student.id))
            console.log('Found parent link:', link)
            setLinkedParent(link)
            
            if (link?.parent) {
              form.setValue('parentId', String(link.parent))
            } else {
              form.setValue('parentId', "none")
            }
          }
        } catch (error) {
          console.error('Error fetching data:', error)
          toast({
            title: "Error",
            description: "Failed to load parent information",
            variant: "destructive",
          })
        }
      }
      fetchData()
    }
  }, [open, student?.id, form])

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      // First update student info
      await studentApi.update(student.id, {
        name: values.name,
        email: values.email,
        level: values.level,
        lessons_remaining: values.lessons_remaining,
        subscription_balance: values.subscription_balance,
      })

      // Handle parent linking/unlinking
      const newParentId = values.parentId && values.parentId !== "none" ? parseInt(values.parentId) : null
      const currentParentId = linkedParent?.parent

      try {
        if (newParentId !== currentParentId) {
          if (currentParentId) {
            // First unlink current parent if exists
            console.log('Unlinking current parent:', { currentParentId, studentId: student.id })
            await parentApi.unlinkFromStudent({
              parent_id: currentParentId,
              student_id: parseInt(student.id)
            })
          }
          
          if (newParentId) {
            try {
              // Then link new parent if selected
              console.log('Linking new parent:', { newParentId, studentId: student.id })
              await parentApi.linkToStudent({
                parent_id: newParentId,
                student_id: parseInt(student.id)
              })
            } catch (error: any) {
              if (error.message === 'Student already has a parent') {
                toast({
                  title: "Error",
                  description: "This student already has a parent assigned",
                  variant: "destructive",
                })
                return;
              }
              throw error;
            }
          }
        }

        toast({
          title: "Success!",
          description: "Student information has been updated.",
        })

        if (onSuccess) {
          onSuccess()
        }

        onOpenChange(false)
      } catch (linkError: any) {
        console.error('Error managing parent link:', linkError.response?.data || linkError)
        toast({
          title: "Warning",
          description: linkError.message || "Failed to update parent link",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error('Error updating student:', error.response?.data || error)
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update student information.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            Make changes to the student information here.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Student name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A1 (Beginner)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lessons_remaining"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lessons Remaining</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subscription_balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Balance</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a parent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No parent</SelectItem>
                        {Array.isArray(parents) && parents.length > 0 ? (
                          parents.map((parent) => (
                            <SelectItem key={parent.id} value={parent.id.toString()}>
                              {parent.name} ({parent.email})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_parents" disabled>No parents available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
