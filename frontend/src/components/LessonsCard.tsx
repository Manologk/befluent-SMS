import { AlertCircle, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { studentApi } from '@/services/api';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SubscriptionInfo {
    plan_name: string;
    total_lessons: number;
    start_date: string;
    end_date: string | null;
}

interface StudentData {
    id: number;
    user_id: number;
    name: string;
    email: string;
    lessons_remaining: number;
    subscription_balance: number;
    level: string;
    total_lessons: number;
    subscription_info: SubscriptionInfo | null;
}

const LessonsCard = () => {
    const { user } = useAuth();
    const [studentData, setStudentData] = useState<StudentData>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // const remainingLessons = 12;
    // const percentage = (remainingLessons / totalLessons) * 100;

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                setError(null);
                if (user?.user_id) {
                    console.log('Fetching student data for user ID:', user.user_id);
                    const response = await studentApi.getById(user.user_id);
                    console.log('Student data received:', response.data);
                    if (response && response.data) {
                        setStudentData(response.data);
                        if (response.data.total_lessons === 0) {
                            setError('No active subscription found');
                        }
                    } else {
                        setError('Invalid response format');
                        console.error('Invalid response format:', response);
                    }
                }
            } catch (error) {
                setError('Failed to fetch student data');
                console.error('Failed to fetch student data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [user?.user_id]);

    if (loading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <List className="h-6 w-6" />
                        Remaining Lessons
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <p>Loading student data...</p>
                </CardContent>
            </Card>
        );
    }

    if (error || !studentData) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <List className="h-6 w-6" />
                        Remaining Lessons
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {error || 'No data available for this student'}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    const { lessons_remaining, total_lessons, subscription_info } = studentData;
    const remainingLessons = lessons_remaining;
    const percentage = total_lessons > 0 ? (remainingLessons / total_lessons) * 100 : 0;
    console.log("Lessons Info:", { 
        remaining: lessons_remaining, 
        total: total_lessons,
        subscription: subscription_info 
    });
    
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <List className="h-6 w-6" />
                    Remaining Lessons
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                            className="text-muted stroke-current"
                            strokeWidth="10"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                        />
                        <circle
                            className="text-primary stroke-current"
                            strokeWidth="10"
                            strokeLinecap="round"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                            strokeDasharray={`${percentage * 2.51} 251.2`}
                            transform="rotate(-90 50 50)"
                        />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <p className="text-3xl font-bold">{remainingLessons}</p>
                        <p className="text-sm text-muted-foreground">remaining</p>
                    </div>
                </div>
                <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        {remainingLessons} out of {total_lessons} lessons remaining
                    </p>
                    {subscription_info && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {subscription_info.plan_name}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default LessonsCard;