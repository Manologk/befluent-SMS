import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, LogOut, Settings, User } from "lucide-react";
import ProfileDialog from "@/components/ProfileDialog";
import SettingsDialog from "@/components/SettingsDialog";

import { useAuth } from "@/contexts/AuthContext";
import { studentApi } from "@/services/api";
import { useNavigate } from "react-router-dom";

interface StudentData {
    user_id: number;
    name: string;
    email: string;
    level: string;
    phone_numer: string;
}

const Header = () => {
    const [profileOpen, setProfileOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [studentData, setStudentData] = useState<StudentData>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // In a real app, this would come from your auth system
    const course = "English";

    const { user } = useAuth();
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                if (user?.user_id) {
                    const response = await studentApi.getById(user.user_id);
                    if (response && response.data) {
                        setStudentData(response.data);
                        setError(null);
                    } else {
                        setError('Invalid response format');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch student data:', error);
                setError('Failed to fetch student data');
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [user?.user_id]);

    if (loading) {
        return <p>Loading student data...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (!studentData) {
        return <p>No data available for this student.</p>;
    }

    const { level, name, email } = studentData;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <>
            <header className="border-b">
                <div className="flex h-16 items-center px-4 md:px-8">
                    <div className="flex items-center gap-2 font-semibold">
                        <BookOpen className="h-6 w-6" />
                        <span>Student Portal</span>
                    </div>

                    <div className="ml-auto flex items-center gap-4">
                        <div className="hidden text-right md:block">
                            <p className="text-lg font-bold">{name}</p>
                            <p className="text-xs text-muted-foreground">{email}</p>
                            <p className="text-xs text-muted-foreground">
                                {level} • {course}
                            </p>
                        </div>

                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={handleLogout}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <User className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
            <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        </>
    );
};

export default Header;