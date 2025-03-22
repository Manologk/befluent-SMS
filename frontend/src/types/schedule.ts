export interface Student {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    avatar?: string;
    attendance: 'present' | 'absent' | 'late';
    testResults?: {
      date: string;
      score: number;
      feedback: string;
    }[];
  }
  
  export interface Lesson {
    id: string;
    time: string;
    language: string;
    students: Student[];
    date: string;
  }
  
  export interface DailySchedule {
    date: string;
    dayOfWeek: string;
    lessons: Lesson[];
  }
  
  export interface WeeklySchedule {
    [date: string]: DailySchedule;
  }
  
  export interface Session {
    id: string;
    date: string;
    time: string;
    language: string;
    level: string;
  }
  
  