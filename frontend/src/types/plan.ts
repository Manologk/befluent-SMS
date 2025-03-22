export interface Plan {
    id: number;
    name: string;
    description: string;
    number_of_lessons: number;
    price: number;
  }
  
  export interface CreatePlanPayload {
    name: string;
    description: string;
    number_of_lessons: number;
    price: number;
  }
  
  export interface SortConfig {
    key: keyof Plan;
    direction: 'asc' | 'desc';
  }
  
  export interface PlanFormData extends Omit<Plan, 'id'> {
    id?: number;
  }