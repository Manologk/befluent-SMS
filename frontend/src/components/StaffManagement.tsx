"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ChevronUp, ChevronDown, Search } from 'lucide-react'

// Mock data for demonstration
const staffData = [
  {
    id: 1,
    name: "John Smith",
    position: "Math Teacher",
    department: "Mathematics",
    email: "john.smith@school.com",
    phone: "123-456-7890",
    joinDate: "2020-09-01",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    position: "Science Teacher",
    department: "Science",
    email: "sarah.johnson@school.com",
    phone: "234-567-8901",
    joinDate: "2019-08-15",
  },
  {
    id: 3,
    name: "Michael Brown",
    position: "English Teacher",
    department: "English",
    email: "michael.brown@school.com",
    phone: "345-678-9012",
    joinDate: "2021-01-10",
  },
  {
    id: 4,
    name: "Emily Davis",
    position: "History Teacher",
    department: "Social Studies",
    email: "emily.davis@school.com",
    phone: "456-789-0123",
    joinDate: "2018-11-20",
  },
  {
    id: 5,
    name: "David Wilson",
    position: "Physical Education Teacher",
    department: "Physical Education",
    email: "david.wilson@school.com",
    phone: "567-890-1234",
    joinDate: "2022-03-05",
  },
]

type SortConfig = {
  key: keyof typeof staffData[0]
  direction: 'ascending' | 'descending'
}

export function StaffManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' })
  const [editingStaff, setEditingStaff] = useState<typeof staffData[0] | null>(null)

  const filteredAndSortedData = useMemo(() => {
    let filtered = staffData.filter(staff => 
      Object.values(staff).some(value => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )

    return filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1
      }
      return 0
    })
  }, [searchTerm, sortConfig])

  const requestSort = (key: keyof typeof staffData[0]) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: keyof typeof staffData[0]) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Management</CardTitle>
        <CardDescription>View and manage staff information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => requestSort('name')} className="cursor-pointer">
                  Name {getSortIcon('name')}
                </TableHead>
                <TableHead onClick={() => requestSort('position')} className="cursor-pointer">
                  Position {getSortIcon('position')}
                </TableHead>
                <TableHead onClick={() => requestSort('department')} className="cursor-pointer">
                  Department {getSortIcon('department')}
                </TableHead>
                <TableHead onClick={() => requestSort('email')} className="cursor-pointer">
                  Email {getSortIcon('email')}
                </TableHead>
                <TableHead onClick={() => requestSort('joinDate')} className="cursor-pointer">
                  Join Date {getSortIcon('joinDate')}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.name}</TableCell>
                  <TableCell>{staff.position}</TableCell>
                  <TableCell>{staff.department}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.joinDate}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => setEditingStaff(staff)}>View/Edit</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>{editingStaff?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                              Name
                            </Label>
                            <Input id="name" value={editingStaff?.name} className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="position" className="text-right">
                              Position
                            </Label>
                            <Input id="position" value={editingStaff?.position} className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="department" className="text-right">
                              Department
                            </Label>
                            <Input id="department" value={editingStaff?.department} className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                              Email
                            </Label>
                            <Input id="email" value={editingStaff?.email} className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                              Phone
                            </Label>
                            <Input id="phone" value={editingStaff?.phone} className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="joinDate" className="text-right">
                              Join Date
                            </Label>
                            <Input id="joinDate" type="date" value={editingStaff?.joinDate} className="col-span-3" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Save changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

