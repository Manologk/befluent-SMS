import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Subscription, Student } from '../types/admin'

interface SubscriptionManagementProps {
  subscriptions: Subscription[]
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>
  students: Student[]
}

export function SubscriptionManagement({ subscriptions, setSubscriptions, students }: SubscriptionManagementProps) {
  const [newSubscription, setNewSubscription] = useState<Partial<Subscription>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSubscription({ ...newSubscription, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (value: string, name: string) => {
    setNewSubscription({ ...newSubscription, [name]: value })
  }

  const addSubscription = () => {
    if (newSubscription.studentId && newSubscription.plan && newSubscription.totalLessons && newSubscription.totalAmount) {
      const subscription: Subscription = {
        id: (subscriptions.length + 1).toString(),
        studentId: newSubscription.studentId,
        plan: newSubscription.plan,
        totalLessons: Number(newSubscription.totalLessons),
        lessonsRemaining: Number(newSubscription.totalLessons),
        amountPaid: 0,
        totalAmount: Number(newSubscription.totalAmount),
      }
      setSubscriptions([...subscriptions, subscription])
      setNewSubscription({})
    }
  }

  const updateSubscription = (id: string, field: keyof Subscription, value: string | number) => {
    setSubscriptions(subscriptions.map(sub =>
      sub.id === id ? { ...sub, [field]: value } : sub
    ))
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-5 gap-4">
        <Select onValueChange={(value) => handleSelectChange(value, 'studentId')}>
          <SelectTrigger>
            <SelectValue placeholder="Select Student" />
          </SelectTrigger>
          <SelectContent>
            {students.map(student => (
              <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input placeholder="Plan" name="plan" value={newSubscription.plan || ''} onChange={handleInputChange} />
        <Input placeholder="Total Lessons" name="totalLessons" type="number" value={newSubscription.totalLessons || ''} onChange={handleInputChange} />
        <Input placeholder="Total Amount" name="totalAmount" type="number" value={newSubscription.totalAmount || ''} onChange={handleInputChange} />
        <Button onClick={addSubscription}>Add Subscription</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Total Lessons</TableHead>
            <TableHead>Lessons Remaining</TableHead>
            <TableHead>Amount Paid</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map(subscription => (
            <TableRow key={subscription.id}>
              <TableCell>{students.find(s => s.id === subscription.studentId)?.name}</TableCell>
              <TableCell>{subscription.plan}</TableCell>
              <TableCell>{subscription.totalLessons}</TableCell>
              <TableCell>{subscription.lessonsRemaining}</TableCell>
              <TableCell>
                <Input 
                  type="number" 
                  value={subscription.amountPaid} 
                  onChange={(e) => updateSubscription(subscription.id, 'amountPaid', Number(e.target.value))}
                />
              </TableCell>
              <TableCell>{subscription.totalAmount}</TableCell>
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

