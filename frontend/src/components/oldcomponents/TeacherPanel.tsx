'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { scheduleApi } from '../services/api'
import { DailySchedule, Student } from '../types/schedule'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from '@/hooks/use-toast'
import { TestResultsActions } from '@/components/TestResultsActions'

const QRCodeDialog = ({ student }: { student: Student }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Badge className="cursor-pointer">QR Code</Badge>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{student.name}'s QR Code</DialogTitle>
      </DialogHeader>
      <div className="flex justify-center p-4">
        <QRCodeSVG value={student.id} size={200} />
      </div>
    </DialogContent>
  </Dialog>
)

const AttendanceBadge = ({ attendance }: { attendance: Student['attendance'] }) => {
  const variants = {
    present: 'bg-green-100 text-green-800',
    late: 'bg-yellow-100 text-yellow-800',
    absent: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-sm ${variants[attendance] || ''}`}>
      {attendance}
    </span>
  );
};

const TestResultsTable = ({ students }: { students: Student[] }) => {
  const handleExport = (studentId: string) => {
    // Implement export logic here
    console.log(`Exporting results for student ${studentId}`);
    // You might want to call an API or use a service to export results
  };

  const handleImport = (studentId: string, file: File) => {
    // Implement import logic here
    console.log(`Importing results for student ${studentId}`, file);
    // You might want to call an API or use a service to import results
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Latest Score</TableHead>
          <TableHead>Feedback</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id}>
            <TableCell>{student.name}</TableCell>
            <TableCell>
              {student.testResults?.[0]?.score || 'No tests'}
            </TableCell>
            <TableCell>
              {student.testResults?.[0]?.feedback || 'No feedback'}
            </TableCell>
            <TableCell>
              <TestResultsActions 
                studentId={student.id} 
                onExport={() => handleExport(student.id)}
                onImport={(file) => handleImport(student.id, file)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default function TeacherPanel() {
  const [date, setDate] = useState<Date>(new Date())
  const [schedule, setSchedule] = useState<DailySchedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const formattedDate = format(date, 'yyyy-MM-dd');
        const data = await scheduleApi.getTeacherSchedule(formattedDate);
        setSchedule(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch schedule",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [date]);

  if (loading) {
    return <div>Loading schedule...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Teacher Schedule</h1>
      
      <div className="mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[280px] justify-start text-left font-normal")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {schedule ? (
        <div className="grid gap-4">
          {schedule.lessons.map((lesson) => (
            <Card key={lesson.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{lesson.time}</span>
                  <Badge>{lesson.language}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="students" onValueChange={(value) => setActiveTab({...activeTab, [lesson.id]: value})}>
                  <TabsList>
                    <TabsTrigger value="students">Students</TabsTrigger>
                    <TabsTrigger value="testResults">Test Results</TabsTrigger>
                  </TabsList>
                  <TabsContent value="students">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Phone Number</TableHead>
                          <TableHead>Attendance</TableHead>
                          <TableHead>QR Code</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lesson.students.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="flex items-center space-x-2">
                              <Avatar>
                                <AvatarImage src={student.avatar} alt={student.name} />
                                <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <span>{student.name}</span>
                            </TableCell>
                            <TableCell>{student.phoneNumber}</TableCell>
                            <TableCell>
                              <AttendanceBadge attendance={student.attendance} />
                            </TableCell>
                            <TableCell>
                              <QRCodeDialog student={student} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  <TabsContent value="testResults">
                    <TestResultsTable students={lesson.students} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>No schedule available for the selected date.</p>
      )}
    </div>
  );
}
