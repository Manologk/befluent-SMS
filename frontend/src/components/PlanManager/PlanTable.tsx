import React from 'react';
import { Plan, SortConfig } from '../../types/plan.ts';
import { ArrowUpDown, Edit, Trash2 } from 'lucide-react';

interface PlanTableProps {
  plans: Plan[];
  selectedPlans: number[];
  sortConfig: SortConfig;
  onSort: (key: keyof Plan) => void;
  onEdit: (plan: Plan) => void;
  onDelete: (id: number) => void;
  onSelectPlan: (id: number) => void;
}

export const PlanTable: React.FC<PlanTableProps> = ({
  plans,
  selectedPlans,
  sortConfig,
  onSort,
  onEdit,
  onDelete,
  onSelectPlan,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                onChange={(e) => {
                  plans.forEach((plan) => onSelectPlan(plan.id));
                }}
                checked={selectedPlans.length === plans.length}
              />
            </th>
            {['name', 'price', 'lessons'].map((key) => (
              <th
                key={key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => onSort(key as keyof Plan)}
              >
                <div className="flex items-center gap-2">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </th>
            ))}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {plans.map((plan) => (
            <tr key={plan.id}>
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={selectedPlans.includes(plan.id)}
                  onChange={() => onSelectPlan(plan.id)}
                />
              </td>
              <td className="px-6 py-4">{plan.name}</td>
              <td className="px-6 py-4">₽ {plan.price}</td>
              <td className="px-6 py-4">{plan.number_of_lessons}</td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};