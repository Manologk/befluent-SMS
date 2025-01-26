export interface Student {
    id: string;
    name: string;
    email: string;
    level: string;
    phone_number?: string;
    subscription_plan?: string;
    lessons_remaining?: number;
    subscription_balance?: number;
    qr_code?: string;
}

export interface Teacher {
    id: string;
    name: string;
    email: string;
    specializations: string[];
    phone_number?: string;
}

export interface Group {
    id: string;
    name: string;
    description?: string;
    language: string;
    level: string;
    teacher?: Teacher;
    max_capacity: number;
    status: string;
    current_capacity: number;
    created_at: string;
    updated_at: string;
    students?: Student[];
}

export interface CreateGroupPayload {
    name: string;
    description?: string;
    category: string;
    level: string;
    max_capacity: number;
    teacher_id?: string;
    schedule?: {
        day: number;
        start_time: string;
        end_time: string;
    };
}

export interface GroupFilters {
    search: string;
    category: string;
    level: string;
}

// Mock data
export const mockStudents: Student[] = [
    { id: '1', name: 'Alice Johnson', level: '10th', email: 'alice@school.com' },
    { id: '2', name: 'Bob Smith', level: '10th', email: 'bob@school.com' },
    { id: '3', name: 'Carol White', level: '11th', email: 'carol@school.com' },
    { id: '4', name: 'David Brown', level: '11th', email: 'david@school.com' },
    { id: '5', name: 'Eve Wilson', level: '12th', email: 'eve@school.com' },
];

export const mockTeachers: Teacher[] = [
    { id: 't1', name: 'Dr. Sarah Parker', email: 'sarah@school.com', specializations: ['Mathematics'] },
    { id: 't2', name: 'Prof. James Wilson', email: 'james@school.com', specializations: ['Science'] },
    { id: 't3', name: 'Mrs. Emily Davis', email: 'emily@school.com', specializations: ['English'] },
];