import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Student, Teacher, Assignment, Group as ApiGroup } from '@/types'
import  MultipleSelector, { Option } from "@/components/ui/multiple-selector"

import { scheduleApi } from '@/services/api';
import { CreateSchedulePayload } from '@/services/api';
import { teacherApi } from '@/services/api'
import { studentApi } from '@/services/api'
import { groupApi } from '@/services/api'
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  teacher_id: z.string().min(1, "Teacher is required"),
  assignmentType: z.enum(['group', 'private']),
  group_id: z.string().optional(),
  student_id: z.string().optional(),
  days: z.array(z.number().min(0).max(6)).min(1, "At least one day must be selected"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  is_recurring: z.boolean().default(true),
  payment: z.number().min(0, "Payment must be a positive number"),
}).refine(
  (data) => {
    // Ensure either group_id or student_id is provided, but not both
    if (data.assignmentType === 'group') {
      return !!data.group_id && !data.student_id;
    } else {
      return !!data.student_id && !data.group_id;
    }
  },
  {
    message: "Must provide either group or student, but not both",
    path: ["assignmentType"],
  }
).refine(
  (data) => {
    const start = new Date(`1970-01-01T${data.start_time}`);
    const end = new Date(`1970-01-01T${data.end_time}`);
    return start < end;
  },
  {
    message: "End time must be after start time",
    path: ["end_time"],
  }
)

interface CreateScheduleProps {
  teachers: Teacher[];
  students: Student[];
  groups: ApiGroup[];
  assignments: Assignment[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
}

const DAYS_OPTIONS: Option[] = [
  { value: "0", label: "Monday" },
  { value: "1", label: "Tuesday" },
  { value: "2", label: "Wednesday" },
  { value: "3", label: "Thursday" },
  { value: "4", label: "Friday" },
  { value: "5", label: "Saturday" },
  { value: "6", label: "Sunday" },
]

export default function CreateSchedule({ 
  teachers, 
  students,
  groups,
  assignments,
  setTeachers,
  setAssignments,
}: CreateScheduleProps) {
  const [assignmentType, setAssignmentType] = useState<'group' | 'private'>('private')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchStudents = async () => {
    if (assignmentType === 'private') {
      try {
        const data = await studentApi.getAll()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch students",
          variant: "destructive",
        })
      }
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [toast, assignmentType])

  useEffect(() => {
    async function fetchGroups() {
      if (assignmentType === 'group') {
        try {
          await groupApi.getAll()
        } catch (error) {
          console.error('Error fetching groups:', error)
          toast({
            title: "Error",
            description: "Failed to fetch groups",
            variant: "destructive",
          })
        }
      }
    }

    fetchGroups()
  }, [toast, assignmentType])

  useEffect(() => {
    async function fetchTeachers() {
      try {
        setLoading(true)
        const data = await teacherApi.getAll()
        // Transform the API response to match the UI's expected format
        const transformedTeachers = data.map(teacher => ({
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          contactDetails: teacher.phone_number || '',
          specializations: teacher.specializations || []
        }));
        setTeachers(transformedTeachers)
      } catch (error) {
        console.error('Error fetching teachers:', error)
        toast({
          title: "Error",
          description: "Failed to fetch teachers",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTeachers()
  }, [setTeachers, toast])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacher_id: "",
      assignmentType: "private",
      group_id: "",
      student_id: "",
      days: [],
      start_time: "",
      end_time: "",
      is_recurring: true,
      payment: undefined,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const scheduleData: CreateSchedulePayload = {
        teacher_id: values.teacher_id,
        type: values.assignmentType,
        student_id: values.assignmentType === 'private' ? values.student_id : undefined,
        group_id: values.assignmentType === 'group' ? values.group_id : undefined,
        days: values.days,  
        start_time: values.start_time,
        end_time: values.end_time,
        is_recurring: values.is_recurring,  
        payment: values.payment
      };

      const newSchedule = await scheduleApi.createSchedule(scheduleData);
      
      setAssignments([...assignments, {
        id: newSchedule.id,
        teacherId: newSchedule.teacher_id,
        studentId: newSchedule.student_id,
        groupId: newSchedule.group_id,
        date: newSchedule.date_time,
        type: newSchedule.type,
        duration: newSchedule.duration,
        payment: newSchedule.payment
      }]);

      toast({
        title: "Success",
        description: "Schedule created successfully",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create schedule",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Create New Schedule</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <>
              <FormField
                control={form.control}
                name="teacher_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher</FormLabel>
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

              <FormField
                control={form.control}
                name="assignmentType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Assignment Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value)
                          setAssignmentType(value as 'group' | 'private')
                        }}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="private" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Private Lesson
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="group" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Group Lesson
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="group_id"
                render={({ field }) => (
                  <>
                    {assignmentType === 'group' ? (
                      <FormItem>
                        <FormLabel>Group</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a group">
                                {groups.find(g => g.id.toString() === field.value)?.name || "Select a group"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {groups.map((group) => (
                              <SelectItem key={group.id} value={group.id.toString()}>
                                {group.name} ({group.current_capacity}/{group.max_capacity} students)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select a group for the lesson
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    ) : null}
                  </>
                )}
              />

              <FormField
                control={form.control}
                name="student_id"
                render={({ field }) => (
                  <>
                    {assignmentType === 'private' ? (
                      <FormItem>
                        <FormLabel>Student</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a student" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {students.map((student) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    ) : null}
                  </>
                )}
              />

              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days</FormLabel>
                    <FormControl>
                      <MultipleSelector
                        value={field.value?.map((day: number) => DAYS_OPTIONS[day])}
                        options={DAYS_OPTIONS}
                        placeholder="Select days"
                        onChange={(options: Option[]) => {
                          field.onChange(options.map(opt => parseInt(opt.value)))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_recurring"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Is Recurring</FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={field.disabled}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter payment amount"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Create Schedule</Button>
            </>
          )}
        </form>
      </Form>
    </div>
  )
}
