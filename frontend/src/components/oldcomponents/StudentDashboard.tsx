'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Student, Session } from '../types/schedule'
import { toast } from 'react-hot-toast'

interface StudentStats {
  lessonsRemaining: number
  attendanceRate: number
  averageScore: number
  upcomingSessions: Session[]
  recentPerformance: {
    date: string
    vocabulary: number
    grammar: number
    speaking: number
    listening: number
  }[]
}

const PerformanceCard = ({ performance }: { performance: StudentStats['recentPerformance'][0] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-sm font-medium">Performance - {performance.date}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm">Vocabulary</span>
            <span className="text-sm font-bold">{performance.vocabulary}%</span>
          </div>
          <Progress value={performance.vocabulary} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm">Grammar</span>
            <span className="text-sm font-bold">{performance.grammar}%</span>
          </div>
          <Progress value={performance.grammar} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm">Speaking</span>
            <span className="text-sm font-bold">{performance.speaking}%</span>
          </div>
          <Progress value={performance.speaking} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm">Listening</span>
            <span className="text-sm font-bold">{performance.listening}%</span>
          </div>
          <Progress value={performance.listening} />
        </div>
      </div>
    </CardContent>
  </Card>
)

const UpcomingLessons = ({ sessions }: { sessions: Session[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Upcoming Lessons</CardTitle>
      <CardDescription>Your scheduled lessons for the next 7 days</CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Level</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>{session.date}</TableCell>
              <TableCell>{session.time}</TableCell>
              <TableCell>{session.language}</TableCell>
              <TableCell>
                <Badge variant="outline">{session.level}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
)

const StatsCards = ({ stats }: { stats: StudentStats }) => (
  <div className="grid gap-4 md:grid-cols-3">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Lessons Remaining</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.lessonsRemaining}</div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.averageScore}%</div>
      </CardContent>
    </Card>
  </div>
)

export default function StudentDashboard() {
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Replace with actual API call
        const response = await fetch('/api/students/dashboard');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching student data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  if (loading || !stats) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
      
      <StatsCards stats={stats} />

      <div className="grid gap-4 md:grid-cols-2">
        <UpcomingLessons sessions={stats.upcomingSessions} />
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Performance</CardTitle>
            <CardDescription>Your performance in recent lessons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentPerformance.map((perf, index) => (
              <PerformanceCard key={index} performance={perf} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 