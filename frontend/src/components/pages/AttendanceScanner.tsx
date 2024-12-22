import React, { useState } from 'react';
import QRScanner from '../QRScanner';
import { useToast } from '@/hooks/use-toast';
import { Card } from '../ui/card';
import { studentApi } from '@/services/api';

const AttendanceScanner: React.FC = () => {
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleScanSuccess = async (qrData: string) => {
        if (isProcessing) return;
        
        setIsProcessing(true);
        try {
            const response = await studentApi.reduceLesson(qrData);
            
            if (response.success) {
                toast({
                    title: "Success!",
                    description: response.message || "Attendance marked successfully",
                });
            } else {
                throw new Error(response.message || 'Failed to mark attendance');
            }

        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : 'Failed to mark attendance',
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
                            onScanSuccess={handleScanSuccess}
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
