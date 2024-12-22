import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Student, Teacher, Subscription } from '../types/admin'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { QRCodeSVG } from 'qrcode.react'

interface StudentManagementProps {
  students: Student[]
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>
  teachers: Teacher[]
  subscriptions: Subscription[]
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>
}

const QRCodeDialog = ({ student }: { student: Student }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">QR Code</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR Code for {student.name}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center p-4">
          <QRCodeSVG value={student.id} size={200} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function StudentManagement({ students, setStudents }: StudentManagementProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;
  
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(students.length / studentsPerPage);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Lessons Remaining</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentStudents.map(student => (
            <TableRow key={student.id}>
              <TableCell>{student.id}</TableCell>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{student.level}</TableCell>
              <TableCell>{student.lessonsRemaining}</TableCell>
              <TableCell className="space-x-2">
                <Button variant="outline" size="sm">Edit</Button>
                <QRCodeDialog student={student} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, students.length)} of {students.length} students
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}