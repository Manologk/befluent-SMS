import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Student, Subscription } from "../types/admin"
import { studentApi, subscriptionApi } from '../services/api'
import { toast } from 'react-hot-toast'

const AttendanceRecord = ({ student }: { student: Student }) => {
  // Mock attendance data - in real app, this would come from your backend
  const attendance = {
    present: student.lessonsRemaining > 0 ? 15 : 0,
    absent: 2,
    late: 3,
    total: 20
  }

  const attendanceRate = (attendance.present / attendance.total) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>{student.name}'s Attendance Record</CardTitle>
        <CardDescription>Overall attendance performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Attendance Rate</span>
            <span className="font-bold">{attendanceRate.toFixed(1)}%</span>
          </div>
          <Progress value={attendanceRate} />
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="bg-green-50">Present: {attendance.present}</div>
            </div>
            <div className="text-center">
              <div className="bg-red-50">Absent: {attendance.absent}</div>
            </div>
            <div className="text-center">
              <div className="bg-yellow-50">Late: {attendance.late}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const ProgressTracker = ({ student }: { student: Student }) => {
  const testScores = [85, 92, 78, 88, 95] // This would come from your backend
  const averageScore = testScores.reduce((a, b) => a + b, 0) / testScores.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>{student.name}'s Progress</CardTitle>
        <CardDescription>Track learning progress and test scores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span>Average Score</span>
              <span className="font-bold">{averageScore.toFixed(1)}%</span>
            </div>
            <Progress value={averageScore} />
          </div>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Latest Test Score</TableCell>
                <TableCell className="text-right">{testScores[testScores.length - 1]}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Highest Score</TableCell>
                <TableCell className="text-right">{Math.max(...testScores)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Tests Taken</TableCell>
                <TableCell className="text-right">{testScores.length}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

const SubscriptionStatus = ({ student, subscription }: { student: Student, subscription: Subscription }) => {
  const progress = (subscription.lessonsRemaining / subscription.totalLessons) * 100
  const paymentProgress = (subscription.amountPaid / subscription.totalAmount) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Status</CardTitle>
        <CardDescription>{student.name}'s subscription details and payment status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span>Student</span>
              <span className="font-bold">{student.name}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span>Lessons Remaining</span>
              <span className="font-bold">{subscription.lessonsRemaining} / {subscription.totalLessons}</span>
            </div>
            <Progress value={progress} />
          </div>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Student ID</TableCell>
                <TableCell className="text-right">{student.id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Plan</TableCell>
                <TableCell className="text-right">{subscription.plan}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Payment Status</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span>{subscription.amountPaid} / {subscription.totalAmount} paid</span>
                    <Progress value={paymentProgress} className="w-20" />
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<Student[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.id) {
          setError('User not found. Please login again.');
          return;
        }

        // Get parent's students
        const studentsData = await studentApi.getByParentId(user.id);
        
        // Get subscriptions for each student
        const subscriptionsData = await Promise.all(
          studentsData.map(student => subscriptionApi.getByStudentId(student.id))
        );

        setChildren(studentsData);
        setSubscriptions(subscriptionsData.flat());
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Parent Dashboard</h1>
      {children.map((child) => {
        const subscription = subscriptions.find(s => s.studentId === child.id);
        if (!subscription) return null;

        return (
          <div key={child.id} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{child.name}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <AttendanceRecord student={child} />
              <ProgressTracker student={child} />
              <SubscriptionStatus student={child} subscription={subscription} />
            </div>
          </div>
        );
      })}
    </div>
  )
}