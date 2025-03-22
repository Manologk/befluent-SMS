import { StaffManagement } from "@/components/StaffManagement"


export default function StaffManagementPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
      </div>
      <div className="border-b" />
      <StaffManagement />
    </div>
  );
}

