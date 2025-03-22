import React from 'react';
import { Group } from '@/types/groupManager';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Users } from "lucide-react";

interface GroupListProps {
  groups: Group[];
  onEdit: (group: Group) => void;
  onDelete: (groupId: string) => void;
  onManageMembers: (group: Group) => void;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  full: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-red-100 text-red-800',
};

export const GroupList: React.FC<GroupListProps> = ({
  groups,
  onEdit,
  onDelete,
  onManageMembers,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.length === 0 ? (
        <div className="col-span-full text-center py-8 text-gray-500">
          No groups found
        </div>
      ) : (
        groups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {group.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    {group.description}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className={statusColors[group.status]}>
                  {group.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Language:</span>
                    <Badge variant="outline" className="ml-2">
                      {group.language}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Level:</span>
                    <Badge variant="outline" className="ml-2">
                      {group.level}
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-500" />
                    <span>
                      {group.current_capacity}/{group.max_capacity} students
                    </span>
                  </div>
                  <div className="text-gray-500">
                    {group.teacher ? group.teacher.name : 'No teacher assigned'}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onManageMembers(group)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Members
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(group)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      onClick={() => onDelete(group.id.toString())}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default GroupList;