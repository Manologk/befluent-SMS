// import React, { useState } from 'react';
// import { TeacherSession } from '@/types/session';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Clock, Users, User, BookOpen, QrCode } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import { sessionApi } from '@/services/api';
// import QRScanner from './QRScanner';

// interface SessionCardProps {
//   session: TeacherSession;
//   onSessionUpdate?: (session: TeacherSession) => void;
// }

// export const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
//   const [showScanner, setShowScanner] = useState(false);
//   const { toast } = useToast();

//   const handleScanSuccess = async (qrData: string) => {
//     try {
//       await sessionApi.markAttendance({
//         sessionId: session.id,
//         studentId: qrData,
//       });

//       toast({
//         title: 'Success',
//         description: 'Attendance marked successfully',
//       });
//       setShowScanner(false);
//     } catch (error) {
//       console.error('Error marking attendance:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to mark attendance. Please try again.',
//         variant: 'destructive',
//       });
//     }
//   };

//   const isActive = () => {
//     const now = new Date();
//     const sessionStart = new Date(`${session.date}T${session.start_time}`);
//     const sessionEnd = new Date(`${session.date}T${session.end_time}`);
//     return now >= sessionStart && now <= sessionEnd;
//   };

//   return (
//     <Card className="hover:border-blue-500 transition-colors">
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <div>
//             <CardTitle className="flex items-center gap-2">
//               {session.language} - {session.level}
//             </CardTitle>
//             <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
//               <Clock className="h-4 w-4" />
//               <span>{session.start_time} - {session.end_time}</span>
//             </div>
//           </div>
//           <Badge variant={session.type === 'Private' ? 'default' : 'secondary'}>
//             {session.type}
//           </Badge>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <div className="flex items-center gap-2">
//             <BookOpen className="h-4 w-4" />
//             <span>{session.topic || 'No topic set'}</span>
//           </div>
          
//           <div className="flex items-center gap-2">
//             {session.type === 'Private' ? (
//               <>
//                 <User className="h-4 w-4" />
//                 <span>{session.student_name}</span>
//               </>
//             ) : (
//               <>
//                 <Users className="h-4 w-4" />
//                 <span>{session.group_name}</span>
//               </>
//             )}
//           </div>

//           {isActive() && (
//             <Dialog open={showScanner} onOpenChange={setShowScanner}>
//               <Button 
//                 variant="outline" 
//                 className="w-full mt-2"
//                 onClick={() => setShowScanner(true)}
//               >
//                 <QrCode className="h-4 w-4 mr-2" />
//                 Mark Attendance
//               </Button>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Scan Student QR Code</DialogTitle>
//                 </DialogHeader>
//                 <QRScanner
//                   onScanSuccess={handleScanSuccess}
//                   onScanError={(error) => {
//                     toast({
//                       title: 'Error',
//                       description: error,
//                       variant: 'destructive',
//                     });
//                   }}
//                 />
//               </DialogContent>
//             </Dialog>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };
