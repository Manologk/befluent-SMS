"use client"

import React, { useState, useEffect } from 'react'
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

interface Teacher {
  id: string
  name: string
  email: string
  specializations: string[]
}

interface EditTeacherDialogProps {
  teacher: Teacher
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditTeacherDialog({ teacher, open, onOpenChange, onSuccess }: EditTeacherDialogProps) {
  const [formData, setFormData] = useState({
    name: teacher.name,
    email: teacher.email,
    specializations: teacher.specializations,
  })
  const { toast } = useToast()

  useEffect(() => {
    setFormData({
      name: teacher.name,
      email: teacher.email,
      specializations: teacher.specializations,
    })
  }, [teacher])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await teacherApi.update(teacher.id, {
        name: formData.name,
        email: formData.email,
        specializations: formData.specializations,
      })
      toast({
        title: "Success",
        description: "Teacher updated successfully",
      })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update teacher",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Teacher</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
          <Button type="submit" className="w-full">Update Teacher</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
