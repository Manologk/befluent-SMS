import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { financialApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeacherStats {
  monthlyEarnings: number;
  hoursTaught: number;
  completedClasses: number;
  averageRate: number;
  earningsChange: number;
  hoursChange: number;
  classesChange: number;
  rateChange: number;
}

interface Session {
  id: string;
  date: string;
  amount: number;
  status: string;
  type: string;
  student: string;
  duration: string;
}

const FinancialOverview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const { user } = useAuth();

  const getDateRangeForPeriod = () => {
    const now = new Date();
    switch (period) {
      case 'daily':
        return {
          start: format(now, 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd')
        };
      case 'weekly':
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        const end = new Date(now);
        end.setDate(now.getDate() + (6 - now.getDay())); // End of week (Saturday)
        return {
          start: format(start, 'yyyy-MM-dd'),
          end: format(end, 'yyyy-MM-dd')
        };
      case 'monthly':
      default:
        return {
          start: format(startOfMonth(now), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd')
        };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.user_id) return;

      try {
        setLoading(true);
        const dateRange = getDateRangeForPeriod();
        const [statsData, sessionsData, earningsData] = await Promise.all([
          financialApi.getTeacherStats(user.user_id.toString()),
          financialApi.getTeacherSessions(
            user.user_id.toString(),
            dateRange.start,
            dateRange.end
          ),
          financialApi.getTeacherEarnings(user.user_id.toString(), period)
        ]);

        // Merge earnings data with stats
        const mergedStats = {
          ...statsData,
          ...earningsData
        };

        setStats(mergedStats);
        setSessions(sessionsData);
      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, period]); // Added period as a dependency

  const statsConfig = stats ? [
    {
      title: "Monthly Earnings",
      value: `$${stats.monthlyEarnings.toFixed(2)}`,
      change: `${stats.earningsChange > 0 ? '+' : ''}${stats.earningsChange}%`,
      trend: stats.earningsChange >= 0 ? "up" : "down",
      icon: DollarSign,
      color: "blue",
    },
    {
      title: "Hours Taught",
      value: stats.hoursTaught.toString(),
      change: `${stats.hoursChange > 0 ? '+' : ''}${stats.hoursChange}%`,
      trend: stats.hoursChange >= 0 ? "up" : "down",
      icon: Clock,
      color: "green",
    },
    {
      title: "Classes",
      value: stats.completedClasses.toString(),
      change: `${stats.classesChange > 0 ? '+' : ''}${stats.classesChange}%`,
      trend: stats.classesChange >= 0 ? "up" : "down",
      icon: Calendar,
      color: "purple",
    },
    {
      title: "Average Rate",
      value: `$${stats.averageRate.toFixed(2)}/hr`,
      change: `${stats.rateChange > 0 ? '+' : ''}${stats.rateChange}%`,
      trend: stats.rateChange >= 0 ? "up" : "down",
      icon: TrendingUp,
      color: "orange",
    },
  ] : [];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>Your earnings and financial metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="mt-3 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="space-y-4 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>Your earnings and financial metrics</CardDescription>
        </div>
        <Select value={period} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setPeriod(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsConfig.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-2">
                  <div className={`p-2 rounded-full bg-${stat.color}-100`}>
                    <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
                  </div>
                  <span className={`text-xs font-medium inline-flex items-center rounded-full px-2 py-1 ${
                    stat.trend === 'up' 
                      ? 'text-green-700 bg-green-100' 
                      : 'text-red-700 bg-red-100'
                  }`}>
                    {stat.change}
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-3 h-3 ml-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 ml-1" />
                    )}
                  </span>
                </div>
                <div className="mt-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </h3>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Sessions</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.student}</TableCell>
                    <TableCell>{session.type}</TableCell>
                    <TableCell>{session.duration}</TableCell>
                    <TableCell>${session.amount}</TableCell>
                    <TableCell>
                      <Badge variant={session.status === 'Completed' ? 'default' : 'secondary'}>
                        {session.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {format(new Date(session.date), 'MMM d, yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialOverview;