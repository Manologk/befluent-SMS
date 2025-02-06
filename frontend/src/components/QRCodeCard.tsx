import { useState, useEffect } from "react";
import { QrCode, ZoomIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { studentApi } from '@/services/api';
// import { toast } from "react-hot-toast";



interface StudentData {
    user_id: number;
    qr_code: string;
}



const QRCodeCard = () => {
    const [isZoomed, setIsZoomed] = useState(false);
    const isMobile = useIsMobile();
    const [studentData, setStudentData] = useState<StudentData>()
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // QR code data is simply the user ID
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


    const { qr_code } = studentData;

    const  qrCodeData = qr_code;

    console.log("User Data = ", qrCodeData)
    const qrCodeSize = isMobile ? Math.min(window.innerWidth - 64, 384) : 384;

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <QrCode className="h-6 w-6" />
                            Your QR Code
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsZoomed(true)}
                            className="h-8 w-8"
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex justify-center p-6">
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <QRCodeSVG
                                value={qrCodeData}
                                size={192}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
                <DialogContent className="sm:max-w-md mx-4">
                    <DialogHeader>
                        <DialogTitle>Scan QR Code</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center p-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <QRCodeSVG
                                value={qrCodeData}
                                size={qrCodeSize}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default QRCodeCard;