import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Teacher } from '../types/admin'

interface TeacherManagementProps {
  teachers: Teacher[]
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>
}

export function TeacherManagement({ teachers, setTeachers }: TeacherManagementProps) {
  const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTeacher({ ...newTeacher, [e.target.name]: e.target.value })
  }

  const addTeacher = () => {
    if (newTeacher.name && newTeacher.email && newTeacher.specialization) {
      const teacher: Teacher = {
        id: (teachers.length + 1).toString(),
        name: newTeacher.name,
        email: newTeacher.email,
        specialization: newTeacher.specialization,
      }
      setTeachers([...teachers, teacher])
      setNewTeacher({})
    }
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-4 gap-4">
        <Input placeholder="Name" name="name" value={newTeacher.name || ''} onChange={handleInputChange} />
        <Input placeholder="Email" name="email" value={newTeacher.email || ''} onChange={handleInputChange} />
        <Input placeholder="Specialization" name="specialization" value={newTeacher.specialization || ''} onChange={handleInputChange} />
        <Button onClick={addTeacher}>Add Teacher</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map(teacher => (
            <TableRow key={teacher.id}>
              <TableCell>{teacher.name}</TableCell>
              <TableCell>{teacher.email}</TableCell>
              <TableCell>{teacher.specialization}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

