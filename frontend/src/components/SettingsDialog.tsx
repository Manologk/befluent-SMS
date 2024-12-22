import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Label } from "@/components/ui/label";
  import { Switch } from "@/components/ui/switch";
  
  interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }
  
  const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage your account settings and preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="flex flex-col gap-1">
                <span>Email Notifications</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Receive email updates about your courses
                </span>
              </Label>
              <Switch id="notifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="tfa" className="flex flex-col gap-1">
                <span>Two-Factor Authentication</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Add an extra layer of security
                </span>
              </Label>
              <Switch id="tfa" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default SettingsDialog;