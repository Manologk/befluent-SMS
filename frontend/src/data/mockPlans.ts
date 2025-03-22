import { Plan, CreatePlanPayload } from '@/types/plan';
import { planApi } from '@/services/api';

export const getPlans = async (): Promise<Plan[]> => {
    try {
        return (await planApi.getAll()).data;
    } catch (error) {
        console.error('Failed to fetch plans:', error);
        return [];
    }
};

export const createPlan = async (plan: CreatePlanPayload) => {
    return await planApi.create(plan);
};

export const updatePlan = async (id: number, plan: Partial<Omit<Plan, 'id'>>) => {
    return await planApi.update(id, plan);
};

export const deletePlan = async (id: number) => {
    return await planApi.delete(id);
};