import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from './ui/button';
import { Card } from './ui/card';
// import { toast } from 'react-hot-toast';
// import { studentApi } from '../services/api';

interface QRScannerProps {
    onScanSuccess: (qrData: string) => Promise<void>;
    onScanError?: (error: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanError }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isScanningRef = useRef(false);
    const scannedCodesRef = useRef<Set<string>>(new Set());

    const cleanupScanner = async () => {
        if (!scannerRef.current) return;

        try {
            if (isScanningRef.current) {
                isScanningRef.current = false;
                await scannerRef.current.stop();
                console.log('Camera stopped successfully');
            }
        } catch (err) {
            console.error('Error stopping camera:', err);
        }

        try {
            await scannerRef.current.clear();
            scannerRef.current = null;
            console.log('Scanner cleared successfully');
        } catch (err) {
            console.error('Error clearing scanner:', err);
        }

        setIsScanning(false);
        setMessage(null);

        const qrReader = document.getElementById('qr-reader');
        if (qrReader) {
            qrReader.innerHTML = '';
        }
    };

    useEffect(() => {
        return () => {
            cleanupScanner();
        };
    }, []);

    const handleScan = async (decodedText: string) => {
        if (!isScanningRef.current) return;

        try {
            if (scannedCodesRef.current.has(decodedText)) {
                setMessage("Attendance already marked for today");
                return;
            }

            console.log('Raw QR code data:', decodedText);
            console.log('QR code data type:', typeof decodedText);
            
            // Trim any whitespace
            const cleanedText = decodedText.trim();
            console.log('Cleaned QR code data:', cleanedText);

            // Parse the QR code data as a number
            const studentId = parseInt(cleanedText, 10);
            console.log('Parsed student ID:', studentId);
            
            if (isNaN(studentId)) {
                throw new Error(`Invalid QR code format: "${cleanedText}" is not a valid student ID number`);
            }

            // Add to scanned codes
            scannedCodesRef.current.add(decodedText);
            
            // Pause scanning
            if (scannerRef.current) {
                isScanningRef.current = false;
                await scannerRef.current.pause(true);
            }
            
            console.log('Raw QR code data:', decodedText);
            console.log('Parsed student ID:', studentId);
            
            // Call the parent handler with the parsed student ID
            await onScanSuccess(studentId.toString());
            
            // Only cleanup after successful processing
            await cleanupScanner();
        } catch (error) {
            // If there's an error, resume scanning
            if (scannerRef.current && !isScanningRef.current) {
                isScanningRef.current = true;
                await scannerRef.current.resume();
            }
            
            const errorMessage = error instanceof Error ? error.message : 'Error processing QR code';
            console.error('QR scan error:', error);
            if (onScanError) {
                onScanError(errorMessage);
            }
            
            // Remove from scanned codes if there was an error
            scannedCodesRef.current.delete(decodedText);
            setError(errorMessage);
        }
    };

    const startScanning = async () => {
        setMessage(null);
        setError(null);

        if (isScanningRef.current) {
            await cleanupScanner();
        }

        try {
            const scanner = new Html5Qrcode('qr-reader');
            scannerRef.current = scanner;

            setIsScanning(true);
            isScanningRef.current = true;

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                handleScan,
                (errorMessage) => {
                    // Only log scanning errors if we're actually scanning
                    if (isScanningRef.current) {
                        console.log(errorMessage);
                    }
                }
            );
            console.log('Camera started successfully');
        } catch (err) {
            console.error('Error starting scanner:', err);
            await cleanupScanner();
            setError('Failed to start camera. Please ensure camera permissions are granted.');
            if (onScanError) {
                onScanError(err instanceof Error ? err.message : 'Unknown error');
            }
        }
    };

    const stopScanning = async () => {
        await cleanupScanner();
    };

    const resetScanner = () => {
        scannedCodesRef.current.clear();
        setMessage(null);
        setError(null);
    };

    return (
        <Card className="p-4 w-full max-w-md mx-auto">
            <div className="space-y-4">
                <div id="qr-reader" className="w-full" style={{ minHeight: '300px' }} />
                <div className="flex justify-center gap-2">
                    {!isScanning ? (
                        <>
                            <Button onClick={startScanning}>Start Scanning</Button>
                            <Button onClick={resetScanner} variant="outline">Reset Scanner</Button>
                        </>
                    ) : (
                        <Button onClick={stopScanning} variant="destructive">Stop Scanning</Button>
                    )}
                </div>
                {message && (
                    <div className="text-yellow-600 text-center font-medium">{message}</div>
                )}
                {error && (
                    <div className="text-red-500 text-center">{error}</div>
                )}
            </div>
        </Card>
    );
};

export default QRScanner;
