export interface Group {
  id: string;
  name: string;
  description: string;
  language: string;
  level: string;
  maxCapacity: number;
  currentCapacity: number;
  students: string[]; // Array of student IDs
  teachers: string[]; // Array of teacher IDs
  schedule?: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
}

export type GroupStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface CreateGroupPayload {
  name: string;
  description: string;
  language: string;
  level: string;
  max_capacity: number; // Changed to match API
  teacher: string; // Teacher ID
  status: GroupStatus;
}

export interface UpdateGroupPayload {
  name?: string;
  description?: string;
  language?: string;
  level?: string;
  max_capacity?: number; // Changed to match API
  teacher?: string;
  status?: GroupStatus;
}

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
} 