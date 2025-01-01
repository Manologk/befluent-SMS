import axios from 'axios';
import { TeacherSession, AttendanceRecord, ClassSchedule } from '@/types/session';
// import { User } from '../types/auth';

const API_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request headers:', config.headers);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken
        });

        const { access } = response.data;
        localStorage.setItem('token', access); // Updated to use 'token' consistently
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axios(originalRequest);
      } catch (err) {
        // Refresh token failed - clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user_id: number;
  email: string;
  role: string;
  qr_code: string;
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
}

// Student interfaces
interface CreateStudentPayload {
  user: number;
  name: string;
  email: string;
  phone_number: string;
  subscription_plan: string;
  level: string;
  student_type: string;
  qr_code: string;
  subscription_balance: number;
  lessons_remaining: number;
}

export interface Group {
  id: string;
  name: string;
  teacher: {
    id: string;
    name: string;
    email: string;
    specializations: string[];
  };
  max_capacity: number;
  status: string;
  current_capacity: number;
  created_at: string;
}

export interface CreateGroupPayload {
  name: string;
  teacher: string;  // teacher ID
  max_capacity: number;
  status: string;
  schedule?: {
    day: number;
    start_time: string;
    end_time: string;
  };
}

export interface CreateSchedulePayload {
  teacher_id: string;
  type: 'group' | 'private';
  student_id?: string;
  group_id?: string;
  days: number[];  // Changed to number[] to match Django's expectation
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  payment: number;
}

export interface CreatePlanPayload {
  name: string;
  description: string;
  price: number;
  number_of_lessons: number;
}

// Auth endpoints
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      console.log('Sending login request with:', credentials);
      const { data } = await api.post('/token/', credentials);
      console.log('Raw login response:', data);
      
      // Store the tokens
      localStorage.setItem('token', data.access);
      if (data.refresh) {
        localStorage.setItem('refresh', data.refresh);
      }

      // Get user details from token response
      // const userResponse = await api.get('/accounts/', {
      //   headers: {
      //     Authorization: `Bearer ${data.access}`
      //   }
      // });
      
      // console.log('User details:', userResponse.data);

      return {
        access: data.access,
        refresh: data.refresh,
        user_id: data.user_id,
        email: data.email,
        role: data.role
      };
    } catch (error) {
      console.error('API login error:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
  }
};

// Student endpoints
export const studentApi = {
  getAll: async () => {
    try {
      const { data } = await api.get('/students/students/');
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Student API Error:', error.response?.data);
        throw new Error(error.response?.data?.detail || 'Failed to fetch students');
      }
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const { data } = await api.get(`/students/students/${id}/`);
      console.log('Student data response:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Failed to fetch student:', error);
      throw error;
    }
  },

  getDashboard: async () => {
    try {
      const { data } = await api.get('/students/dashboard/');
      console.log('Dashboard data:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      throw error;
      getDashboard: async () => {
        try {
          const { data } = await api.get('/students/dashboard/');
          console.log('Dashboard data:', data); // Debug log
          return data;
        } catch (error) {
          console.error('Failed to fetch dashboard:', error);
          throw error;
        }
      }
    }
  },

  reduceLesson: async (studentId: string) => {
    try {
      const response = await api.post(`/students/students/${studentId}/reduce_lesson/`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to reduce lesson count');
    }
  },

  refreshQRCode: async (studentId: number | undefined) => {
    if (!studentId) throw new Error('Student ID is required');
    try {
      const { data } = await api.post(`/students/students/${studentId}/refresh-qr/`);
      return data;
    } catch (error) {
      console.error('QR Code refresh error:', error);
      throw error;
    }
  },

  create: async (data: CreateStudentPayload) => {
    return api.post('/students/students/', data);
  },

  createWithUser: async (data: {
    name: string;
    email: string;
    phone_number: string;
    subscription_plan: string;
    level: string;
    password: string;
  }) => {
    try {
      const response = await api.post('/students/students/create-with-user/', data);
      console.log('Create student with user response:', response);
      return response;
    } catch (error) {
      console.error('Error creating student with user:', error);
      throw error;
    }
  },
};

// Teacher endpoints
export const teacherApi = {
  getAll: async () => {
    try {
      const { data } = await api.get('/students/teachers/');
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch teachers');
      }
      throw error;
    }
  }
};

// Parent endpoints
export const parentApi = {
  async getAll() {
    try {
      const response = await fetch(`${API_URL}/parents/parents/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if required
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include', // Include if using cookies
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json(); // Parse JSON here
      return data; // Return the parsed data
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },

  getParentById: async (id: number) => {
    try {
      const response = await api.get(`/parents/${id}/`);
      console.log('Student data response:', response); // Debug log
      return response;  
  }catch (error) {
    console.error('Failed to fetch student:', error);
    throw error;
  }
}
}

// Subscription endpoints
export const subscriptionApi = {
  getAll: async () => {
    try {
      const { data } = await api.get('/students/student-subscriptions/');
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch subscriptions');
      }
      throw error;
    }
  },

  getByStudentId: async (studentId: string) => {
    try {
      const { data } = await api.get(`/students/student-subscriptions/?student=${studentId}`);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch subscription');
      }
      throw error;
    }
  }
};


// Group endpoints
export const groupApi = {
  createGroup: async (name: string, max_capacity: number) => {
    try {
      const { data } = await api.post(`/students/groups/`, {name, max_capacity});
      return data
    } catch(error) {
      if (axios.isAxiosError(error)){
        throw new Error(error.response?.data?.message || 'Failed to create group')
      }
      throw error
    }
  },

  getAll: async () => {
    try {
      const { data } = await api.get('/students/groups/');
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch groups');
      }
      throw error;
    }
  }
}


// Session endpoint
export const sessionApi = {
  getSessionsByDate: async (date: string) => {
    try {
      const { data } = await api.get(`/students/sessions/?date=${date}`);
      return data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  },

  getTeacherSessions: async (date: string) => {
    try {
      const response = await api.get(`/students/sessions/`, {
        params: {
          date: date
        }
      });
      console.log('Teacher sessions response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher sessions:', error);
      throw error;
    }
  },

  async markAttendance(data: { sessionId: string; studentId: string }) {
    const response = await api.post('/students/attendance/', data);
    return response.data;
  },

  async getAttendance(sessionId: string) {
    const response = await api.get(`/students/attendance/?session=${sessionId}`);
    return response.data;
  },

  async toggleActivation(sessionId: string) {
    const response = await api.post(`/students/sessions/${sessionId}/toggle_activation/`);
    return response.data;
  },

  getSessionDetails: async (sessionId: string) => {
    try {
      const response = await api.get(`/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get session details');
    }
  }
};

// Schedule endpoints
export const scheduleApi = {
  getWeeklySchedule: async (date: string) => {
    try {
      const { data } = await api.get(`/students/sessions/?date=${date}`);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch schedule');
      }
      throw error;
    }
  },
  
  markAttendance: async (studentId: string, lessonId: string, attendance: string) => {
    try {
      const { data } = await api.post(`/students/attendance/`, {
        student: studentId,
        session: lessonId,
        attendance
      });
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to mark attendance');
      }
      throw error;
    }
  },

  getTeacherSchedule: async (date: string) => {
    try {
      const { data } = await api.get(`/schedule/teacher/${date}`);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch schedule');
      }
      throw error;
    }
  },

  updateAttendance: async (studentId: string, lessonId: string, status: string) => {
    try {
      const { data } = await api.post(`/students/attendance/`, {
        student: studentId,
        session: lessonId,
        status
      });
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to mark attendance');
      }
      throw error;
    }
  },

  createSchedule: async (scheduleData: CreateSchedulePayload) => {
    try {
      const { data } = await api.post('/students/schedules/', {
        teacher_id: scheduleData.teacher_id,
        type: scheduleData.type,
        student_id: scheduleData.student_id,
        group_id: scheduleData.group_id,
        days: scheduleData.days,
        start_time: scheduleData.start_time,
        end_time: scheduleData.end_time,
        is_recurring: scheduleData.is_recurring,
        payment: scheduleData.payment
      });
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create schedule');
      }
      throw error;
    }
  },

  getScheduleById: async (id: string) => {
    try {
      const { data } = await api.get(`/students/sessions/${id}/`);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch schedule');
      }
      throw error;
    }
  },

  updateSchedule: async (id: string, scheduleData: Partial<CreateSchedulePayload>) => {
    try {
      const { data } = await api.patch(`/students/schedules/${id}/`, {
        teacher_id: scheduleData.teacher_id,
        type: scheduleData.type,
        student_id: scheduleData.student_id,
        group_id: scheduleData.group_id,
        days: scheduleData.days,
        start_time: scheduleData.start_time,
        end_time: scheduleData.end_time,
        is_recurring: scheduleData.is_recurring,
        payment: scheduleData.payment
      });
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update schedule');
      }
      throw error;
    }
  },

  deleteSchedule: async (id: string) => {
    try {
      await api.delete(`/students/sessions/${id}/`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete schedule');
      }
      throw error;
    }
  }
};

// Subscription Plan endpoints
export const planApi = {
  getAll: async () => {
    try {
      const response = await api.get('/students/subscription-plans/');
      console.log('Full API Response:', response);
      console.log('Subscription plans data:', response.data);
      return response; // Return the whole response, not just response.data
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  },
  
  create: async (planData: CreatePlanPayload) => {
    const response = await api.post('/students/subscription-plans/', planData);
    return response.data;
  },
  
  update: async (id: number, planData: Partial<CreatePlanPayload>) => {
    const response = await api.patch(`/students/subscription-plans/${id}/`, planData);
    return response.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/students/subscription-plans/${id}/`);
  }
};

// User management endpoints
export interface CreateUserPayload {
    email: string;
    password: string;
    role: 'admin' | 'instructor' | 'student' | 'parent';
}

export const userApi = {
  createUser: async (userData: CreateUserPayload) => {
    try {
      const response = await api.post('/accounts/users/', userData);
      console.log('Create user response:', response);
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
};

export default api;
