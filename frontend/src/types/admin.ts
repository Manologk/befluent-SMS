export interface Student {
    level: string;
    id: string;
    name: string;
    email: string;
    grade: string;
    parentId?: string;
    teacherId?: string;
    lessonsRemaining: number;
    subscriptionId?: string;
  }
  
  export interface Teacher {
    id: string;
    name: string;
    email: string;
    specialization: string;
  }
  
  export interface Parent {
    id: string;
    name: string;
    email: string;
    phone: string;
  }
  
  export interface Subscription {
    id: string;
    studentId: string;
    plan: string;
    totalLessons: number;
    lessonsRemaining: number;
    amountPaid: number;
    totalAmount: number;
  }
  
  