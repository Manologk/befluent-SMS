import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ScheduleCard = () => {
  const schedule = [
    { day: "Monday", time: "10:00 AM", class: "Mathematics" },
    { day: "Wednesday", time: "2:00 PM", class: "Physics" },
    { day: "Friday", time: "11:00 AM", class: "Chemistry" },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Class Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedule.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div>
                <p className="font-medium">{item.class}</p>
                <p className="text-sm text-muted-foreground">{item.day}</p>
              </div>
              <p className="text-primary font-medium">{item.time}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleCard;