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
    maxCapacity: number;
    teacherId?: string;
    studentIds: string[];
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
  
  