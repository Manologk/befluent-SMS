import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Label } from "@/components/ui/label";
  import { Input } from "@/components/ui/input";
  
  interface ProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }
  
  const ProfileDialog = ({ open, onOpenChange }: ProfileDialogProps) => {
    // In a real app, this would come from your auth system
    const studentData = {
      name: "John Doe",
      email: "john.doe@university.edu",
      studentId: "STU123",
      course: "Computer Science",
      year: "3rd Year",
      department: "School of Computing",
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Profile Information</DialogTitle>
            <DialogDescription>
              View your profile information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={studentData.name} readOnly />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={studentData.email} readOnly />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course">Course</Label>
              <Input id="course" value={studentData.course} readOnly />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default ProfileDialog;