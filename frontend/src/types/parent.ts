export interface Parent {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  address?: string;
  total_lessons_remaining: number;
  total_subscription_balance: number;
  children: {
    id: string;
    name: string;
    grade: string;
  }[];
}

export interface CreateParentPayload {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  address?: string;
}

export interface UpdateParentPayload {
  name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
} 