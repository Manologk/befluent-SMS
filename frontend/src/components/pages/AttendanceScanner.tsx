import React, { useState } from 'react';
import QRScanner from '../QRScanner';
import { useToast } from '@/hooks/use-toast';
import { Card } from '../ui/card';
import { studentApi } from '@/services/api';
import { sessionApi } from '@/services/api';

interface Session {
    id: string;
    // Add other session properties as needed
}

const AttendanceScanner: React.FC = () => {
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [onAttendanceMarked, setOnAttendanceMarked] = useState<(() => void) | null>(null);

    const handleQRCodeScan = async (decodedText: string) => {
        if (!currentSession) {
            toast({
                title: "Error",
                description: "No active session selected",
                variant: "destructive",
            });
            return;
        }

        try {
            const studentId = decodedText;
            const attendance = await sessionApi.markAttendance({
                sessionId: currentSession.id,
                studentId
            });
            
            toast({
                title: "Success",
                description: "Attendance marked successfully",
            });
            
            onAttendanceMarked?.();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to mark attendance",
                variant: "destructive",
            });
        }
    };

    const handleScanError = (error: string) => {
        toast({
            title: "Scanner Error",
            description: error,
            variant: "destructive",
        });
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Position the QR code within the camera view to mark attendance
            </p>
            
            <div className="overflow-hidden rounded-lg border bg-background">
                <QRScanner 
                    onScanSuccess={handleQRCodeScan}
                    onScanError={handleScanError}
                />
            </div>
            
            {isProcessing && (
                <p className="text-sm text-muted-foreground animate-pulse">
                    Processing attendance...
                </p>
            )}
        </div>
    );
};

export default AttendanceScanner;
