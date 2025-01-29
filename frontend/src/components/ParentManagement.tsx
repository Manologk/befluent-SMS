"use client"
import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { ChevronUp, ChevronDown, Search, Plus } from 'lucide-react'
import { parentApi } from '@/services/api'
import { useToast } from "@/hooks/use-toast"
import { AddParentForm } from "@/components/add-parent-form"
import { Parent } from '@/types'

type SortConfig = {
  key: keyof Parent
  direction: 'ascending' | 'descending'
}

export function ParentManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' })
  const [parents, setParents] = useState<Parent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchParents = async () => {
      try {
        setIsLoading(true)
        const data = await parentApi.getAll()
        setParents(data)
      } catch (err) {
        setError('Failed to fetch parents')
        toast({
          title: "Error",
          description: "Failed to fetch parents",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchParents()
  }, [toast])

  const getTotalLessonsRemaining = (parent: Parent) => {
    if (parent.total_lessons_remaining !== undefined) {
      return parent.total_lessons_remaining;
    }
    return parent.children.reduce((sum, child) => sum + child.lessons_remaining, 0);
  };

  const getTotalSubscriptionBalance = (parent: Parent) => {
    if (parent.total_subscription_balance !== undefined) {
      return parent.total_subscription_balance;
    }
    return parent.children.reduce((sum, child) => sum + child.subscription_balance, 0);
  };

  const sortedParents = useMemo(() => {
    const sorted = [...parents].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortConfig.key) {
        case 'total_lessons_remaining':
          aValue = getTotalLessonsRemaining(a);
          bValue = getTotalLessonsRemaining(b);
          break;
        case 'total_subscription_balance':
          aValue = getTotalSubscriptionBalance(a);
          bValue = getTotalSubscriptionBalance(b);
          break;
        default:
          aValue = a[sortConfig.key]
          bValue = b[sortConfig.key]
      }

      if (aValue === bValue) return 0
      
      const compareResult = aValue > bValue ? 1 : -1
      return sortConfig.direction === 'ascending' ? compareResult : -compareResult
    })

    return sorted
  }, [parents, sortConfig])

  const filteredParents = useMemo(() => {
    return sortedParents.filter(parent => 
      parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.phone_number.includes(searchTerm)
    )
  }, [sortedParents, searchTerm])

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'ascending' 
        ? 'descending' 
        : 'ascending'
    }))
  }

  const renderSortIcon = (columnKey: SortConfig['key']) => {
    if (sortConfig.key !== columnKey) return null
    return sortConfig.direction === 'ascending' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
  }

  const handleParentAdded = async () => {
    // Refresh the parents list
    try {
      const data = await parentApi.getAll()
      setParents(data)
      setShowAddForm(false) // Hide the form after successful addition
    } catch (error) {
      console.error('Error refreshing parents:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parent Management</CardTitle>
        <CardDescription>Manage parents and their associated students</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search parents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Parent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Parent</DialogTitle>
              </DialogHeader>
              <AddParentForm onSuccess={handleParentAdded} />
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center">
                    Name
                    {renderSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('email')}>
                  <div className="flex items-center">
                    Email
                    {renderSortIcon('email')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('phone_number')}>
                  <div className="flex items-center">
                    Phone
                    {renderSortIcon('phone_number')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('total_lessons_remaining')}>
                  <div className="flex items-center">
                    Total Lessons
                    {renderSortIcon('total_lessons_remaining')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('total_subscription_balance')}>
                  <div className="flex items-center">
                    Balance
                    {renderSortIcon('total_subscription_balance')}
                  </div>
                </TableHead>
                <TableHead>Children</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-red-500">{error}</TableCell>
                </TableRow>
              ) : filteredParents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No parents found</TableCell>
                </TableRow>
              ) : (
                filteredParents.map((parent) => (
                  <TableRow key={parent.id}>
                    <TableCell>{parent.name}</TableCell>
                    <TableCell>{parent.email}</TableCell>
                    <TableCell>{parent.phone_number}</TableCell>
                    <TableCell>{getTotalLessonsRemaining(parent)}</TableCell>
                    <TableCell>${getTotalSubscriptionBalance(parent)}</TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {parent.children.map((child) => (
                          <div key={child.id} className="mb-1">
                            <div className="font-medium">{child.name}</div>
                            <div className="text-muted-foreground">
                              Level: {child.level} • Lessons: {child.lessons_remaining}
                            </div>
                            <Progress 
                              value={(child.lessons_remaining / (child.lessons_remaining + child.subscription_balance)) * 100} 
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
