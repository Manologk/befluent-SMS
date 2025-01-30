import axios from 'axios';
import { Session } from '@/types';

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
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
      localStorage.removeItem('token');
      window.location.href = '/login';
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
  level: string;
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

  update: async (id: string, data: any) => {
    try {
      const response = await api.patch(`/students/students/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },
};

// Teacher endpoints
export const teacherApi = {
  async getAll() {
    try {
      const response = await api.get('/students/teachers/');
      console.log('Teacher API Response:', response); // Debug log
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }
  },

  async createWithUser(data: {
    name: string;
    email: string;
    password: string;
    phone_number: string;
    specializations: string[];
  }) {
    try {
      const response = await api.post('/students/teachers/create-with-user/', data);
      console.log('Create teacher response:', response);
      return response;
    } catch (error) {
      console.error('Error creating teacher:', error);
      throw error;
    }
  },

  async update(id: string, data: {
    name: string;
    email: string;
    specializations: string[];
  }) {
    try {
      const { data: responseData } = await api.patch(`/students/teachers/${id}/`, data);
      return responseData;
    } catch (error) {
      console.error('Error updating teacher:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      await api.delete(`/students/teachers/${id}/`);
    } catch (error) {
      console.error('Error deleting teacher:', error);
      throw error;
    }
  }
};

// Parent endpoints
export const parentApi = {
  getAll(): Promise<Parent[]> {
    return api.get('/parents/parents/').then(response => response.data);
  },

  getParentById(id: number): Promise<Parent> {
    return api.get(`/parents/parents/${id}/`).then(response => response.data);
  },

  getParentStudentLinks(): Promise<any[]> {
    return api.get('/parents/parent-student-links/').then(response => response.data);
  },

  getStudentParentLink(studentId: number): Promise<any> {
    return api.get(`/parents/parent-student-links/?student=${studentId}`).then(response => {
      const links = response.data.filter((link: any) => link.student === studentId);
      return links.length > 0 ? links[0] : null;
    });
  },

  create(data: {
    name: string;
    email: string;
    phone_number: string;
    password: string;
  }): Promise<Parent> {
    return api.post('/parents/parents/', data).then(response => response.data);
  },

  linkToStudent(data: {
    parent_id: number;
    student_id: number;
  }): Promise<void> {
    return this.getStudentParentLink(data.student_id).then(existingLink => {
      if (existingLink) {
        throw new Error('Student already has a parent');
      }
      return api.post('/parents/parent-student-links/', {
        parent: data.parent_id,
        student: data.student_id
      });
    });
  },

  unlinkFromStudent(data: {
    parent_id: number;
    student_id: number;
  }): Promise<void> {
    return api.get(`/parents/parent-student-links/?student=${data.student_id}&parent=${data.parent_id}`)
      .then(response => {
        const links = response.data.filter(
          (link: any) => link.student === data.student_id && link.parent === data.parent_id
        );
        if (links.length > 0) {
          return api.delete(`/parents/parent-student-links/${links[0].id}/`);
        }
        throw new Error('Parent-student link not found');
      });
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
  getAll: async () => {
    const response = await api.get('/students/groups/');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/students/groups/${id}/`);
    return response.data;
  },
  create: (data: CreateGroupPayload) => api.post('/students/groups/', data),
  update: (id: string, data: Partial<CreateGroupPayload>) => api.put(`/students/groups/${id}/`, data),
  delete: (id: string) => api.delete(`/students/groups/${id}/`),
  addStudent: (groupId: string, studentId: string) => 
    api.post(`/students/groups/${groupId}/add_student/`, { student_id: studentId }),
  removeStudent: (groupId: string, studentId: string) => 
    api.post(`/students/groups/${groupId}/remove_student/`, { student_id: studentId }),
  getTeacherGroups: (teacherId: string) => 
    api.get(`/students/teachers/${teacherId}/groups/`),
  getStudentGroups: (studentId: string) => 
    api.get(`/students/students/${studentId}/groups/`),
};

// Session endpoint
export const sessionApi = {
  getSessionsByDate: async (date: string): Promise<Session[]> => {
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

// Attendance endpoint
export const attendanceApi = {
  async getAttendanceLogs(startDate?: string, endDate?: string) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await api.get(`/attendance-logs/?${params.toString()}`);
      
      // Transform the data to match frontend requirements
      return response.data.map((record: any) => ({
        ...record,
        // Add computed properties for frontend display
        studentName: record.student.name,
        date: record.session.date,
        timeIn: record.session.start_time,
        timeOut: record.session.end_time,
        notes: '', // Optional field
        grade: record.student.level || '', // Map from student level
        language: record.session.type || '', // Map from session type
        classId: record.session.id
      }));
    } catch (error) {
      console.error('Error fetching attendance logs:', error);
      throw error;
    }
  },

  createAttendanceLog: async (data: { student: string; session: string }) => {
    try {
      const response = await api.post('/students/attendance-logs/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating attendance log:', error);
      throw error;
    }
  },

  updateAttendanceStatus: async (id: string, status: 'present' | 'absent' | 'late') => {
    try {
      const response = await api.post('/students/attendance-logs/update_status/', {
        id,
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating attendance status:', error);
      throw error;
    }
  }
};

// Group management API functions
export const groupService = {
  getGroups: () => api.get('/students/groups/'),
  getGroup: (id: number) => api.get(`/students/groups/${id}/`),
  createGroup: (data: {
    name: string;
    description: string;
    language: string;
    level: string;
    max_capacity: number;
  }) => api.post('/students/groups/', data),
  updateGroup: (id: number, data: Partial<{
    name: string;
    description: string;
    language: string;
    level: string;
    max_capacity: number;
    status: string;
  }>) => api.put(`/students/groups/${id}/`, data),
  deleteGroup: (id: number) => api.delete(`/students/groups/${id}/`),
  addStudentsToGroup: (groupId: number, studentIds: number[]) => 
    api.post(`/students/groups/${groupId}/add_students/`, { student_ids: studentIds }),
  removeStudentFromGroup: (groupId: number, studentId: number) =>
    api.post(`/students/groups/${groupId}/remove_student/`, { student_id: studentId }),
  assignTeacherToGroup: (groupId: number, teacherId?: number) => {
    // If teacherId is undefined, it means we want to remove the teacher
    if (teacherId === undefined) {
      return api.post(`/students/groups/${groupId}/remove_teacher/`);
    }
    // Otherwise assign the new teacher
    return api.post(`/students/groups/${groupId}/assign_teacher/`, { 
      teacher_id: teacherId 
    });
  },
  removeTeacherFromGroup: (groupId: number) => 
    api.post(`/students/groups/${groupId}/remove_teacher/`)
};

export default api;
