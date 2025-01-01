"use client"

import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { userApi, studentApi, planApi } from "@/services/api"
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
  subscriptionPlan: z.string({
    required_error: "Please select a subscription plan.",
  }),
  level: z.enum(["Beginner", "Intermediate", "Advanced"], {
    required_error: "Please select an academic level.",
  }),
})

type FormValues = z.infer<typeof formSchema>

export function AddStudentForm({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [plans, setPlans] = useState<Array<{ id: number; name: string; price: number; number_of_lessons: number }>>([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await planApi.getAll()
        console.log('Fetched plans:', response.data)
        setPlans(response.data)
      } catch (error) {
        console.error('Error fetching plans:', error)
        toast({
          title: "Error",
          description: "Failed to load subscription plans",
          variant: "destructive",
        })
        setPlans([])
      }
    }
    fetchPlans()
  }, [])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      subscriptionPlan: undefined,
      level: undefined,
    },
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const selectedPlan = plans.find(p => p.name.toLowerCase() === values.subscriptionPlan.toLowerCase())
      
      if (!selectedPlan) {
        throw new Error('Selected plan not found')
      }

      // Use the transaction-safe endpoint
      const response = await studentApi.createWithUser({
        name: values.name,
        email: values.email,
        phone_number: values.phoneNumber,
        subscription_plan: values.subscriptionPlan.toLowerCase(),
        level: values.level.toLowerCase(),
        password: 'student123',
      })

      toast({
        title: "Success!",
        description: "Student has been successfully registered.",
      })

      // Clear the form
      form.reset()
      
      navigate('/students')
    } catch (error: any) {
      console.error('Registration error:', error)
      const errorMessage = error.response?.data?.detail || 
                          Object.values(error.response?.data || {}).flat().join(', ') ||
                          "Failed to register student. Please try again."
      
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
        <CardTitle>Add New Student</CardTitle>
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
                    <Input type="tel" placeholder="+7 (999) 123-45-67" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter phone number in Russian format
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subscriptionPlan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscription Plan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {plans && plans.length > 0 ? (
                        plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.name.toLowerCase()}>
                            {plan.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no_plans" disabled>No plans available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register Student"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}