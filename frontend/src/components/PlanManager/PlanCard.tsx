import React from 'react';
import { Plan } from '../../types/plan.ts';
import { Edit, Trash2 } from 'lucide-react';

interface PlanCardProps {
    plan: Plan;
    selected: boolean;
    onSelect: (id: number) => void;
    onEdit: (plan: Plan) => void;
    onDelete: (id: number) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
    plan,
    selected,
    onSelect,
    onEdit,
    onDelete,
}) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onSelect(plan.id)}
                    className="rounded border-gray-300"
                />
                <button
                    onClick={() => onEdit(plan)}
                    className="text-blue-600 hover:text-blue-900"
                >
                    <Edit className="h-5 w-5" />
                </button>
                <button
                    onClick={() => onDelete(plan.id)}
                    className="text-red-600 hover:text-red-900"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>

            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
            <div className="text-2xl font-bold text-blue-600 mb-4">
                ₽{plan.price}/month
            </div>

            <div className="mb-4">
                <span className="text-sm font-medium">Lessons per month: </span>
                <span className="text-lg font-semibold">{plan.number_of_lessons}</span>
            </div>

        </div>
    );
};