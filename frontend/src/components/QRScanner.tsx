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
        try {
            if (scannerRef.current && isScanningRef.current) {
                await scannerRef.current.stop();
                console.log('Camera stopped successfully');
            }
        } catch (err) {
            console.error('Error stopping camera:', err);
        }

        try {
            if (scannerRef.current) {
                await scannerRef.current.clear();
                scannerRef.current = null;
                console.log('Scanner cleared successfully');
            }
        } catch (err) {
            console.error('Error clearing scanner:', err);
        }

        isScanningRef.current = false;
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

    const handleScan = async (data: string) => {
        if (!isScanningRef.current) return;

        try {
            if (scannedCodesRef.current.has(data)) {
                setMessage("Attendance already marked for today");
                return;
            }

            // Add to scanned codes
            scannedCodesRef.current.add(data);
            
            // Pause scanning but don't cleanup yet
            isScanningRef.current = false;
            if (scannerRef.current) {
                await scannerRef.current.pause();
            }
            
            console.log('Raw QR code data:', data);
            
            // Call the parent handler and wait for it to complete
            await onScanSuccess(data);
            
            // Only cleanup after the API call is complete
            await cleanupScanner();
        } catch (error) {
            // If there's an error, resume scanning
            isScanningRef.current = true;
            if (scannerRef.current) {
                await scannerRef.current.resume();
            }
            
            const errorMessage = error instanceof Error ? error.message : 'Error processing QR code';
            console.error('QR scan error:', error);
            if (onScanError) {
                onScanError(errorMessage);
            }
            
            // Remove from scanned codes if there was an error
            scannedCodesRef.current.delete(data);
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
