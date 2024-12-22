import { List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { studentApi } from '@/services/api';

interface StudentData {
    user_id: number;
    name: string;
    email: string;
    lessons_remaining: number;
    subscription_balance: number;
    level: string;
}




const LessonsCard = () => {
    const { user } = useAuth();
    const [studentData, setStudentData] = useState<StudentData>();
    const [loading, setLoading] = useState(true);

    const totalLessons = 50;
    // const remainingLessons = 12;
    // const percentage = (remainingLessons / totalLessons) * 100;

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
    const remainingLessons = lessons_remaining;
    const percentage = (remainingLessons / totalLessons) * 100;
    console.log("Remaining Lessons", lessons_remaining)   
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
                <p className="mt-4 text-sm text-muted-foreground">
                    {remainingLessons} out of {totalLessons} lessons remaining
                </p>
            </CardContent>
        </Card>
    );
};

export default LessonsCard;