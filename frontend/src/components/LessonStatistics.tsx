import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { studentApi } from '../services/api';

interface StudentData {
  user_id: number;
  name: string;
  email: string;
  lessons_remaining: number;
  subscription_balance: number;
  level: string;
}

export function LessonStatistics() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<StudentData>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      console.log("user", user)
      try {
        if (user?.user_id) {
          console.log('Fetching data for user:', user);
          const dashboardData = await studentApi.getById(user.user_id);
          console.log('Dashboard data received:', dashboardData);
          setStudentData(dashboardData);
        }
      } catch (error) {
        console.error('Failed to fetch student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user?.user_id]);

  if (loading) {
    return <p>Loading student data...</p>;
  }

  if (!studentData) {
    return <p>No data available for this student.</p>;
  }

  const { lessons_remaining, subscription_balance, level } = studentData;
  const totalLessons = 50;
  const completedLessons = totalLessons - lessons_remaining;
  const progressPercentage = (completedLessons / totalLessons) * 100;

  // Add chart data
  const chartData = [
    {
      name: 'Current',
      lessons: lessons_remaining,
    },
    {
      name: 'Completed',
      lessons: completedLessons,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Lesson Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <h3 className="text-4xl font-bold mb-2">{lessons_remaining}</h3>
          <p className="text-sm text-gray-500">Remaining Lessons</p>
        </div>
        <Progress value={progressPercentage} className="w-full h-2" />
        <div className="flex justify-between text-sm text-gray-500">
          <span>{completedLessons} Completed</span>
          <span>{totalLessons} Total</span>
        </div>
        <p className="text-sm text-gray-500">Subscription Balance: {subscription_balance}</p>
        <p className="text-sm text-gray-500">Level: {level}</p>

        {/* Add chart */}
        <div className="h-64 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="lessons" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
