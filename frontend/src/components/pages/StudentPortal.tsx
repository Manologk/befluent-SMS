import QRCodeCard from "@/components/QRCodeCard";
import ScheduleCard from "@/components/ScheduleCard";
import LessonsCard from "@/components/LessonsCard";
import Header from "@/components/Header";

export function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Student Portal" />
      <main className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QRCodeCard />
            <ScheduleCard />
            <LessonsCard />
          </div>
        </div>
      </main>
    </div>
  );
};
