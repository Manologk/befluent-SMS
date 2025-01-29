export interface Student {
    id: string;
    name: string;
    contactDetails: string;
    enrollmentDate: string;
    assignmentType: 'group' | 'private';
    groupId?: string;
  }
  
  export interface Teacher {
    id: string;
    name: string;
    contactDetails: string;
  }
  
  export interface Group {
    id: string;
    name: string;
    description?: string;
    language: string;
    level: string;
    teacher?: {
      id: string;
      name: string;
      email: string;
      specializations: string[];
    };
    max_capacity: number;
    status: 'active' | 'inactive' | 'full' | 'archived';
    current_capacity?: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface Assignment {
    id: string;
    teacherId: string;
    studentId?: string;
    groupId?: string;
    date: string;
    type: 'private' | 'group';
    duration: number;
    payment: number;
  }

  export interface Parent {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    user: {
      id: number;
      username: string;
      email: string;
      first_name: string;
      last_name: string;
    };
    children: Array<{
      id: number;
      name: string;
      email: string;
      level: string;
      lessons_remaining: number;
      total_lessons: number;
      subscription_balance: number;
    }>;
    total_lessons_remaining?: number;
    total_subscription_balance?: number;
  }

  export interface ParentStudentLink {
    parent: {
      id: string;
      name: string;
    };
    student: {
      id: string;
      name: string;
    };
  }

  export interface Session {
    id: string;
    date: string;
    time: string;
    className: string;
    students: any[];
    type: 'GROUP' | 'PRIVATE';
    isOnline: boolean;
    proficiencyLevel: string;
    start_time: string;
    end_time: string;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    teacher: number;
    student?: number;
    group?: number;
    student_details?: any;
  }