// import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "../lib/utils";
import { useSidebar } from "@/components/SidebarProvider";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Sheet, SheetContent } from "./ui/sheet";
import { NotebookPen, Users, BookOpen, UserCog, Users2, PiggyBank, Calendar, MessageSquare, BarChart, Settings, ChevronLeft, GraduationCap, QrCode } from 'lucide-react';

const sidebarItems = [
  { name: "Dashboard", href: "/", icon: BarChart },
  { name: "Student Management", href: "/students", icon: Users },
  { name: "Attendance Management", href: "/attendance", icon: QrCode },
  { name: "Academic Planning", href: "/academic", icon: BookOpen },
  { name: "Staff Management", href: "/staff", icon: UserCog },
  { name: "Parent Portal", href: "/parents", icon: Users2 },
  { name: "Financial Management", href: "/finance", icon: PiggyBank },
  { name: "Plans", href: "/plans", icon: NotebookPen },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Messaging", href: "/messaging", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  // const location = useLocation();
  const { state, open, setOpen, isMobile, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className="w-[240px] p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      data-state={state}
      className={cn(
        "relative h-screen border-r bg-background duration-300 ease-in-out",
        open ? "w-[240px]" : "w-[52px]"
      )}
    >
      <div className="flex h-[52px] items-center justify-end border-b px-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setOpen(!open)}
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-all", !open && "rotate-180")}
          />
        </Button>
      </div>
      <SidebarContent />
    </div>
  );
}

function SidebarContent() {
  const location = useLocation();
  const { open } = useSidebar();

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-[52px] items-center gap-2 px-4 py-2">
        <GraduationCap className="h-6 w-6" />
        {open && <span className="font-semibold">School Management</span>}
      </div>
      <ScrollArea className="flex-1 overflow-auto">
        <div className="flex flex-col gap-2 p-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className={cn(
                "w-full justify-start",
                location.pathname === item.href
                  ? "bg-secondary"
                  : "hover:bg-secondary/50",
                !open && "justify-center"
              )}
              asChild
            >
              <Link to={item.href}>
                <item.icon className="h-4 w-4" />
                {open && <span className="ml-2">{item.name}</span>}
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
