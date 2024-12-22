import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Parent } from '../types/admin'

interface ParentManagementProps {
  parents: Parent[]
  setParents: React.Dispatch<React.SetStateAction<Parent[]>>
}

export function ParentManagement({ parents, setParents }: ParentManagementProps) {
  const [newParent, setNewParent] = useState<Partial<Parent>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewParent({ ...newParent, [e.target.name]: e.target.value })
  }

  const addParent = () => {
    if (newParent.name && newParent.email && newParent.phone) {
      const parent: Parent = {
        id: (parents.length + 1).toString(),
        name: newParent.name,
        email: newParent.email,
        phone: newParent.phone,
      }
      setParents([...parents, parent])
      setNewParent({})
    }
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-4 gap-4">
        <Input placeholder="Name" name="name" value={newParent.name ||''} onChange={handleInputChange} />
        <Input placeholder="Email" name="email" value={newParent.email || ''} onChange={handleInputChange} />
        <Input placeholder="Phone" name="phone" value={newParent.phone || ''} onChange={handleInputChange} />
        <Button onClick={addParent}>Add Parent</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parents.map(parent => (
            <TableRow key={parent.id}>
              <TableCell>{parent.name}</TableCell>
              <TableCell>{parent.email}</TableCell>
              <TableCell>{parent.phone}</TableCell>
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

