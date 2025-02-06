"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { teacherApi } from "@/services/api"
import { useNavigate } from "react-router-dom"

const phoneRegex = /^(\+7|8)?[\s-]?\(?[489][0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phoneNumber: z.string().regex(phoneRegex, {
    message: "Please enter a valid phone number.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  specializations: z.string().min(1, {
    message: "Please enter at least one specialization.",
  }),
})

type FormValues = z.infer<typeof formSchema>

interface AddTeacherFormProps extends React.HTMLAttributes<HTMLDivElement> {
  onSuccess?: () => void;
}

export function AddTeacherForm({ className, onSuccess }: AddTeacherFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      specializations: "",
    },
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      await teacherApi.createWithUser({
        name: values.name,
        email: values.email,
        password: values.password,
        phone_number: values.phoneNumber,
        specializations: values.specializations.split(",").map(s => s.trim()).filter(Boolean),
      })

      toast({
        title: "Success!",
        description: "Teacher has been successfully registered.",
      })

      // Clear the form
      form.reset()
      
      // Call onSuccess if provided, otherwise navigate
      if (onSuccess) {
        onSuccess()
      } else {
        navigate('/staff')
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      const errorMessage = error.response?.data?.detail || 
                          Object.values(error.response?.data || {}).flat().join(', ') ||
                          "Failed to register teacher. Please try again."
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Add New Teacher</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+7 (999) 999-99-99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    At least 6 characters long.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specializations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specializations</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="English, Business, IELTS" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter specializations separated by commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Teacher"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
