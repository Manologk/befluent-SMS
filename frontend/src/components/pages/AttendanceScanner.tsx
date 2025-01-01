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
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-2xl mx-auto">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-6 text-center">
                        Scan Attendance QR Code
                    </h1>
                    
                    <div className="space-y-4">
                        <p className="text-center text-muted-foreground">
                            Position the QR code within the camera view to mark your attendance
                        </p>
                        
                        <QRScanner 
                            onScanSuccess={handleQRCodeScan}
                            onScanError={handleScanError}
                        />
                        
                        {isProcessing && (
                            <p className="text-center text-muted-foreground">
                                Processing attendance...
                            </p>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AttendanceScanner;
