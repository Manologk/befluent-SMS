export type UserRole = 'admin' | 'instructor' | 'parent' | 'student';

export interface User {
    user_id: number;
    email: string;
    name?: string;
    role: UserRole; // Update role to use UserRole type
    qr_code?: string; // Make qr_code optional since it's only available for students
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
