import React, { useState, useEffect } from 'react';
import QRScanner from '../QRScanner';
import { useToast } from '@/hooks/use-toast';
import { sessionApi, attendanceApi } from '@/services/api';
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
    const [scannerActive, setScannerActive] = useState(true);

    useEffect(() => {
        const fetchTodaySession = async () => {
            try {
                setIsLoading(true);
                const today = format(new Date(), 'yyyy-MM-dd');
                const sessions = await sessionApi.getSessionsByDate(today);
                const activeSession = sessions.find((session: Session) => session.status === 'IN_PROGRESS');
                
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

        return () => {
            setScannerActive(false);
        };
    }, [toast]);

    const handleQRCodeScan = async (decodedText: string): Promise<void> => {
        if (!currentSession) {
            toast({
                title: "Error",
                description: "No active session available",
                variant: "destructive",
            });
            throw new Error("No active session available");
        }

        try {
            setIsProcessing(true);
            const studentId = decodedText;

            // Create attendance log
            await attendanceApi.createAttendanceLog({
                student: studentId,
                session: currentSession.id
            });
            
            toast({
                title: "Success",
                description: "Attendance marked successfully",
            });
        } catch (error: any) {
            console.error('Error marking attendance:', error);
            const errorMessage = error.response?.data?.detail || 
                               error.response?.data?.error ||
                               "Failed to mark attendance";
            
            // Handle specific error cases
            if (errorMessage.includes('already exists') || errorMessage.includes('already marked')) {
                toast({
                    title: "Already Marked",
                    description: "Attendance has already been marked for this student in this session",
                    variant: "destructive",
                });
            } else if (errorMessage.includes('not found') || errorMessage.includes('Invalid student')) {
                toast({
                    title: "Invalid Student",
                    description: "The scanned QR code is not associated with any student",
                    variant: "destructive",
                });
            } else if (errorMessage.includes('session closed') || errorMessage.includes('session not active')) {
                toast({
                    title: "Session Error",
                    description: "This session is not currently active",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
            throw error; // Re-throw to trigger scanner resume
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
                    
                    {scannerActive && (
                        <div className="overflow-hidden rounded-lg border bg-background">
                            <QRScanner 
                                onScanSuccess={handleQRCodeScan}
                                onScanError={handleScanError}
                            />
                        </div>
                    )}
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
