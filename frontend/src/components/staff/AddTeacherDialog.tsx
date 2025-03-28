"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { teacherApi } from '@/services/api'

interface AddTeacherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddTeacherDialog({ open, onOpenChange, onSuccess }: AddTeacherDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    specializations: [] as string[],
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await teacherApi.createWithUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        specializations: formData.specializations,
      })
      toast({
        title: "Success",
        description: "Teacher added successfully",
      })
      onSuccess()
      onOpenChange(false)
      setFormData({
        name: "",
        email: "",
        password: "",
        phone_number: "",
        specializations: [],
      })
    } catch (error) {
      console.error('Error adding teacher:', error)
      toast({
        title: "Error",
        description: "Failed to add teacher. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="Enter phone number"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Specializations (comma-separated)
            </label>
            <Input
              value={formData.specializations.join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  specializations: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="e.g. English, Business, IELTS"
            />
          </div>
          <Button type="submit" className="w-full">Add Teacher</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
