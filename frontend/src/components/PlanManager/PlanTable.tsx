import React from 'react';
import { Plan, SortConfig } from '../../types/plan.ts';
import { ArrowUpDown, Edit, Trash2, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define column configuration
const COLUMNS = [
  { key: 'name' as const, label: 'Name' },
  { key: 'price' as const, label: 'Price' },
  { key: 'number_of_lessons' as const, label: 'Lessons' }
] as const;

interface PlanTableProps {
  plans: Plan[];
  selectedPlans: number[];
  sortConfig: SortConfig;
  onSort: (key: keyof Plan) => void;
  onEdit: (plan: Plan) => void;
  onDelete: (id: number) => void;
  onSelectPlan: (id: number) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const PlanTable: React.FC<PlanTableProps> = ({
  plans,
  selectedPlans,
  // sortConfig,
  onSort,
  onEdit,
  onDelete,
  onSelectPlan,
  isLoading = false,
  error = null,
}) => {
  // Handle select all toggle
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      plans.forEach((plan) => onSelectPlan(plan.id));
    } else {
      plans.forEach((plan) => {
        if (selectedPlans.includes(plan.id)) {
          onSelectPlan(plan.id);
        }
      });
    }
  };

  if (error) {
    return (
      <div className="text-center py-8 text-red-600" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}
      <table 
        className="min-w-full divide-y divide-gray-200"
        role="grid"
        aria-label="Subscription Plans Table"
      >
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left" scope="col">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                onChange={(e) => handleSelectAll(e.target.checked)}
                checked={plans.length > 0 && selectedPlans.length === plans.length}
                aria-label="Select all plans"
              />
            </th>
            {COLUMNS.map(({ key, label }) => (
              <th
                key={key}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort(key)}
                role="columnheader"
                aria-sort="none"
              >
                <div className="flex items-center gap-2">
                  {label}
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </th>
            ))}
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {plans.map((plan) => (
            <tr 
              key={plan.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={selectedPlans.includes(plan.id)}
                  onChange={() => onSelectPlan(plan.id)}
                  aria-label={`Select ${plan.name}`}
                />
              </td>
              <td className="px-6 py-4">{plan.name}</td>
              <td className="px-6 py-4">₽ {plan.price}</td>
              <td className="px-6 py-4">{plan.number_of_lessons}</td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onEdit(plan)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          aria-label={`Edit ${plan.name}`}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit plan</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onDelete(plan.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          aria-label={`Delete ${plan.name}`}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete plan</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </td>
            </tr>
          ))}
          {plans.length === 0 && !isLoading && (
            <tr>
              <td 
                colSpan={COLUMNS.length + 2} 
                className="px-6 py-8 text-center text-gray-500"
              >
                No plans available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};