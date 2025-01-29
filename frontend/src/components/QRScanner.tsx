import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from './ui/button';
import { Card } from './ui/card';
// import { toast } from 'react-hot-toast';
// import { studentApi } from '../services/api';

interface QRScannerProps {
    onScanSuccess: (qrData: string) => void;
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
        try {
            if (scannerRef.current && isScanningRef.current) {
                // Stop the camera and QR scanning
                await scannerRef.current.stop();
                console.log('Camera stopped successfully');
            }
        } catch (err) {
            console.error('Error stopping camera:', err);
        }

        try {
            if (scannerRef.current) {
                // Clear the HTML elements
                await scannerRef.current.clear();
                scannerRef.current = null;
                console.log('Scanner cleared successfully');
            }
        } catch (err) {
            console.error('Error clearing scanner:', err);
        }

        // Reset states
        isScanningRef.current = false;
        setIsScanning(false);
        setMessage(null);

        // Clear the QR reader element content
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

    const handleScan = async (data: string) => {
        if (!isScanningRef.current) return;

        try {
            // Check if this QR code was already scanned today
            if (scannedCodesRef.current.has(data)) {
                setMessage("Attendance already marked for today");
                return;
            }

            // Add to scanned codes before stopping the scanner
            scannedCodesRef.current.add(data);
            
            // Stop scanning immediately after getting data
            isScanningRef.current = false;
            await cleanupScanner();
            
            console.log('Raw QR code data:', data);
            // Only pass the data to parent when actually scanned
            onScanSuccess(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error processing QR code';
            console.error('QR scan error:', error);
            if (onScanError) {
                onScanError(errorMessage);
            }
        }
    };

    const startScanning = async () => {
        // Reset message when starting new scan
        setMessage(null);
        setError(null);

        // If already scanning, cleanup first
        if (isScanningRef.current) {
            await cleanupScanner();
        }

        try {
            // Create new scanner instance
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
                    // Ignore errors during scanning as they're usually just failed reads
                    console.log(errorMessage);
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

    // Reset scanned codes and start fresh
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
