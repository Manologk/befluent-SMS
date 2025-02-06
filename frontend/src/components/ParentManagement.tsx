"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { ChevronUp, ChevronDown, Search, Plus, X } from 'lucide-react'
import { parentApi } from '@/services/api';
import { useToast } from "@/hooks/use-toast"
import { AddParentForm } from "@/components/add-parent-form"

interface Child {
  id: number
  name: string
  level: string
  lessons_remaining: number
  subscription_balance: number
  total_lessons: number
}

// Update Parent interface to match API response
interface ApiParent {
  id: number
  name: string
  email: string
  phone_number: string
  children: Child[]
}

// Component's Parent interface with additional calculated fields
interface Parent extends ApiParent {
  total_lessons_remaining: number
  total_subscription_balance: number
}

type SortConfig = {
  key: string
  direction: 'ascending' | 'descending'
}

// Helper function for number formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('ru-RU').format(num);
};

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
        setError(null)
        
        const apiData = await parentApi.getAll()
        
        // Transform API data to include calculated fields
        const transformedData: Parent[] = apiData.map((parent: ApiParent) => ({
          ...parent,
          total_lessons_remaining: parent.children.reduce((sum, child) => sum + Number(child.lessons_remaining), 0),
          total_subscription_balance: parent.children.reduce((sum, child) => sum + Number(child.subscription_balance), 0)
        }))
        
        setParents(transformedData)
      } catch (error) {
        console.error('Error fetching parents:', error)
        setError('Failed to load parents data')
        toast({
          title: "Error",
          description: "Failed to load parents data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchParents()
  }, [toast])

  const filteredAndSortedData = useMemo(() => {
    let filtered = parents.filter(parent => 
      parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.children.some(child => child.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return filtered.sort((a, b) => {
      if (sortConfig.key === 'totalKids') {
        return sortConfig.direction === 'ascending' 
          ? a.children.length - b.children.length
          : b.children.length - a.children.length
      }
      if (sortConfig.key === 'totalLessonsRemaining') {
        return sortConfig.direction === 'ascending' 
          ? a.total_lessons_remaining - b.total_lessons_remaining 
          : b.total_lessons_remaining - a.total_lessons_remaining
      }
      if (sortConfig.key === 'totalSubscriptionBalance') {
        return sortConfig.direction === 'ascending' 
          ? a.total_subscription_balance - b.total_subscription_balance 
          : b.total_subscription_balance - a.total_subscription_balance
      }
      if (sortConfig.key === 'name' || sortConfig.key === 'email') {
        const aValue = a[sortConfig.key as keyof Parent]
        const bValue = b[sortConfig.key as keyof Parent]
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1
        return 0
      }
      return 0
    })
  }, [searchTerm, sortConfig, parents])

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
    }
    return null
  }

  const handleParentAdded = async () => {
    try {
      const apiData = await parentApi.getAll()
      const transformedData: Parent[] = apiData.map((parent: ApiParent) => ({
        ...parent,
        total_lessons_remaining: parent.children.reduce((sum, child) => sum + Number(child.lessons_remaining), 0),
        total_subscription_balance: parent.children.reduce((sum, child) => sum + Number(child.subscription_balance), 0)
      }))
      setParents(transformedData)
      setShowAddForm(false)
    } catch (error) {
      console.error('Error refreshing parents:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-red-600">
            <div className="flex items-center gap-2">
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {showAddForm ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Add New Parent</CardTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowAddForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <AddParentForm 
              className="mt-4" 
              onSuccess={handleParentAdded}
            />
          </CardContent>
        </Card>
      ) : (
        <Button 
          onClick={() => setShowAddForm(true)}
          className="mb-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Parent
        </Button>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Parent Portal</CardTitle>
          <CardDescription>View and manage parent and child information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search parents or children..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => requestSort('name')} className="cursor-pointer">
                  Name {getSortIcon('name')}
                </TableHead>
                <TableHead onClick={() => requestSort('email')} className="cursor-pointer">
                  Email {getSortIcon('email')}
                </TableHead>
                <TableHead onClick={() => requestSort('totalKids')} className="cursor-pointer">
                  Total Kids {getSortIcon('totalKids')}
                </TableHead>
                <TableHead onClick={() => requestSort('totalLessonsRemaining')} className="cursor-pointer">
                  Total Lessons Remaining {getSortIcon('totalLessonsRemaining')}
                </TableHead>
                <TableHead onClick={() => requestSort('totalSubscriptionBalance')} className="cursor-pointer">
                  Total Subscription Balance {getSortIcon('totalSubscriptionBalance')}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((parent) => (
                <TableRow key={parent.id}>
                  <TableCell>{parent.name}</TableCell>
                  <TableCell>{parent.email}</TableCell>
                  <TableCell>{formatNumber(parent.children.length)}</TableCell>
                  <TableCell>{formatNumber(parent.total_lessons_remaining)}</TableCell>
                  <TableCell>{formatCurrency(parent.total_subscription_balance)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">View Details</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>{parent.name}'s Children</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh] pr-4">
                          <div className="grid gap-4 py-4">
                            {parent.children.map((child) => (
                              <Card key={child.id}>
                                <CardHeader>
                                  <CardTitle>{child.name}</CardTitle>
                                  <CardDescription>{child.level}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Lessons Progress</h4>
                                    <Progress 
                                      value={(Number(child.lessons_remaining) / (Number(child.total_lessons) || Number(child.lessons_remaining))) * 100} 
                                      className="h-2" 
                                    />
                                    <p className="text-sm text-muted-foreground mt-2">
                                      {formatNumber(Number(child.lessons_remaining))} lessons remaining
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium">Subscription Balance</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {formatCurrency(Number(child.subscription_balance))}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
