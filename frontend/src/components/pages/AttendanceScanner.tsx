import React, { useState, useEffect } from 'react';
import QRScanner from '../QRScanner';
import { useToast } from '@/hooks/use-toast';
import { Card } from '../ui/card';
import { studentApi, sessionApi, attendanceApi } from '@/services/api';
import { format } from 'date-fns';

interface Session {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
}

const AttendanceScanner: React.FC = () => {
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTodaySession = async () => {
            try {
                setIsLoading(true);
                const today = format(new Date(), 'yyyy-MM-dd');
                const sessions = await sessionApi.getSessionsByDate(today);
                const activeSession = sessions.find(session => session.status === 'IN_PROGRESS');
                
                if (activeSession) {
                    setCurrentSession(activeSession);
                } else {
                    toast({
                        title: "No Active Sessions",
                        description: "There are no active sessions for today",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error('Error fetching session:', error);
                toast({
                    title: "Error",
                    description: "Failed to fetch today's session",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchTodaySession();
    }, [toast]);

    const handleQRCodeScan = async (decodedText: string) => {
        if (!currentSession) {
            toast({
                title: "Error",
                description: "No active session available",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsProcessing(true);
            const studentId = decodedText;

            // Create attendance log
            const attendance = await attendanceApi.createAttendanceLog({
                student: studentId,
                session: currentSession.id
            });
            
            toast({
                title: "Success",
                description: "Attendance marked successfully",
            });
        } catch (error) {
            console.error('Error marking attendance:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to mark attendance",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleScanError = (error: string) => {
        toast({
            title: "Scanner Error",
            description: error,
            variant: "destructive",
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <p className="text-sm text-muted-foreground">Loading session...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {currentSession ? (
                <>
                    <div className="text-sm text-muted-foreground">
                        <p>Session: {format(new Date(currentSession.date), 'PPP')}</p>
                        <p>Time: {currentSession.start_time} - {currentSession.end_time}</p>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                        Position the QR code within the camera view to mark attendance
                    </p>
                    
                    <div className="overflow-hidden rounded-lg border bg-background">
                        <QRScanner 
                            onScanSuccess={handleQRCodeScan}
                            onScanError={handleScanError}
                        />
                    </div>
                </>
            ) : (
                <div className="text-center text-sm text-muted-foreground">
                    <p>No active session available for today</p>
                </div>
            )}
            
            {isProcessing && (
                <p className="text-sm text-muted-foreground animate-pulse">
                    Processing...
                </p>
            )}
        </div>
    );
};

export default AttendanceScanner;
