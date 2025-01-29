"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { teacherApi } from "@/services/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddTeacherForm } from "./staff/AddTeacherForm"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface Teacher {
  id: string
  name: string
  email: string
  phone_number: string
  specializations: string[]
  teaching_groups: {
    id: string
    name: string
    description: string
    language: string
    level: string
    current_capacity: number
    max_capacity: number
  }[]
  private_students: {
    id: string
    name: string
    email: string
    level: string
  }[]
}

export function StaffManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTeachers()
  }, [])

  const loadTeachers = async () => {
    try {
      setIsLoading(true)
      const data = await teacherApi.getAll()
      setTeachers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading teachers:', error)
      setTeachers([])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Staff Management</CardTitle>
        <Dialog open={isAddTeacherOpen} onOpenChange={setIsAddTeacherOpen}>
          <DialogTrigger asChild>
            <Button>Add Teacher</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new teacher.
              </DialogDescription>
            </DialogHeader>
            <AddTeacherForm 
              onSuccess={() => {
                loadTeachers();
                setIsAddTeacherOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Specializations</TableHead>
              <TableHead>Classes & Students</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers?.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell>{teacher.name}</TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell>{teacher.phone_number}</TableCell>
                <TableCell>
                  {teacher.specializations?.join(", ") || ""}
                </TableCell>
                <TableCell>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="groups">
                      <AccordionTrigger>
                        Groups ({teacher.teaching_groups?.length || 0})
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-6">
                          {teacher.teaching_groups?.map(group => (
                            <li key={group.id}>
                              {group.name} - {group.language} ({group.level})
                              <br />
                              <span className="text-sm text-gray-500">
                                {group.current_capacity}/{group.max_capacity} students
                              </span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="students">
                      <AccordionTrigger>
                        Private Students ({teacher.private_students?.length || 0})
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-6">
                          {teacher.private_students?.map(student => (
                            <li key={student.id}>
                              {student.name} ({student.level})
                              <br />
                              <span className="text-sm text-gray-500">
                                {student.email}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
