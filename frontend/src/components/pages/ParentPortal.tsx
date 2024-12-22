import React from 'react';
import { ParentManagement as ParentPortalComponent } from "@/components/ParentManagement";

export default function ParentPortal() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Parent Portal</h2>
      </div>
      <div className="border-b" />
      <ParentPortalComponent />
    </div>
  );
}

