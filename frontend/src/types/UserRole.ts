export type UserRole = 'admin' | 'instructor' | 'parent' | 'student';
// Add other roles as necessary

export interface AuthResponse {
  token: string;
  user_id: number;
  email: string;
  role: string;
}

export interface User {
  id: number;
  email: string;
  role: string;
}
