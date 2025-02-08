export type UserRole = 'admin' | 'instructor' | 'parent' | 'student';

export interface User {
    user_id: number;
    email: string;
    name?: string;
    role: UserRole;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
