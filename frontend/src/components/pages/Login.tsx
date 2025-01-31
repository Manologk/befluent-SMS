"use client"

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { authApi } from '@/services/api'
import circleImage from '@/assets/circle-cropped.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await authApi.login({ email, password })
      
      // Check for valid response with required fields
      if (!response || !response.access || !response.user_id || !response.email || !response.role) {
        throw new Error('Invalid response from server')
      }

      // Login successful - update auth context
      login(response.access, {
        user_id: response.user_id,
        email: response.email,
        role: response.role,
      })

      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      })

      // Only navigate on successful login
      navigate('/', { replace: true })
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Handle specific error cases
      let errorMessage = 'Please check your credentials and try again.'
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password.'
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.'
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      })

      // Clear password on failed login
      setPassword('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <img src={circleImage} className="h-12 w-12 mx-auto" alt="Logo" />
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}