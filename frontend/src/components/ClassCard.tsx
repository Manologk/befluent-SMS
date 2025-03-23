import React from "react";
import { Clock, Users, Video, BookOpen, QrCode, ExternalLink } from "lucide-react";
import { ClassSchedule } from "@/types/attendance";
import { useClassActivity } from "@/hooks/useClassActivity";
import { AttendanceProgress } from "./AttendanceProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";

interface ClassCardProps {
  class_: ClassSchedule;
  onStartScanning: (classId: string) => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  class_,
  onStartScanning,
}) => {
  const isActive = useClassActivity(class_.time);

  const handleStartScanning = () => {
    onStartScanning(class_.id);
  };

  return (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-sm">{class_.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={class_.isOnline ? "default" : "secondary"} className={class_.isOnline ? "bg-green-500 hover:bg-green-600" : ""}>
              {class_.isOnline ? "Online" : "In-Person"}
            </Badge>
            {isActive && (
              <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                Active
              </Badge>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-4">{class_.className}</h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Users className="w-4 h-4 text-muted-foreground mt-1" />
            <div className="flex-1">
              {class_.students.length > 0 ? (
                <div className="space-y-2">
                  <AvatarGroup>
                    {class_.students.slice(0, 5).map((student, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar>
                              <AvatarFallback>
                                {student.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{student}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </AvatarGroup>
                  {class_.students.length > 5 && (
                    <p className="text-sm text-muted-foreground">
                      +{class_.students.length - 5} more students
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No students assigned
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <Badge variant="outline">{class_.proficiencyLevel}</Badge>
          </div>

          <div className="pt-2">
            <AttendanceProgress classId={class_.id} />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {class_.isOnline && (
              <Button variant="outline" size="sm" className="text-blue-600">
                <Video className="w-4 h-4 mr-2" />
                Join Meeting
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            )}
            <Button variant="outline" size="sm">
              <BookOpen className="w-4 h-4 mr-2" />
              View Materials
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={handleStartScanning}
              className="bg-green-600 hover:bg-green-700"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Mark Attendance
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
