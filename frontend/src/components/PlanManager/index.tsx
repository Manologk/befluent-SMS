import React, { useState, useMemo, useEffect } from 'react';
import { Plan, SortConfig, PlanFormData } from '../../types/plan.ts';
import { PlanTable } from './PlanTable';
import { PlanForm } from './PlanForm';
import { PlanCard } from './PlanCard';
import { Plus, Search } from 'lucide-react';
import { planApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';

export const PlanManager: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'name',
    direction: 'asc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const fetchedPlans = await planApi.getAll();
        console.log('Fetched plans:', fetchedPlans);
        setPlans(fetchedPlans);
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription plans",
          variant: "destructive",
        });
        setPlans([]);
      }
    };

    fetchPlans();
  }, []);

  const handleSort = (key: keyof Plan) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredAndSortedPlans = useMemo(() => {
    return plans
      .filter((plan) =>
        plan.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        const modifier = sortConfig.direction === 'asc' ? 1 : -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue) * modifier;
        }
        return ((aValue as number) - (bValue as number)) * modifier;
      });
  }, [plans, searchQuery, sortConfig]);

  const handleSubmit = (data: PlanFormData) => {
    if (editingPlan) {
      setPlans((prev) =>
        prev.map((plan) =>
          plan.id === editingPlan.id ? { ...data, id: plan.id } : plan
        )
      );
    } else {
      const newPlan = {
        ...data,
        id: Math.max(...plans.map((p) => p.id)) + 1,
      };
      setPlans((prev) => [...prev, newPlan]);
    }
    setShowForm(false);
    setEditingPlan(undefined);
  };

  const handleDelete = (id: number) => {
    setDeletingPlanId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deletingPlanId) {
      setPlans((prev) => prev.filter((plan) => plan.id !== deletingPlanId));
      setSelectedPlans((prev) => prev.filter((id) => id !== deletingPlanId));
    }
    setShowDeleteConfirm(false);
    setDeletingPlanId(null);
  };

  const handleSelectPlan = (id: number) => {
    setSelectedPlans((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleBulkAction = (action: 'activate' | 'deactivate') => {
    setPlans((prev) =>
      prev.map((plan) =>
        selectedPlans.includes(plan.id)
          ? { ...plan, status: action === 'activate' ? 'active' : 'inactive' }
          : plan
      )
    );
    setSelectedPlans([]);
  };

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Subscription Plans
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Plan
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="flex gap-4">
            <select
              className="rounded-md border border-gray-300 px-4 py-2"
              onChange={(e) => setViewMode(e.target.value as 'table' | 'grid')}
              value={viewMode}
            >
              <option value="table">Table View</option>
              <option value="grid">Grid View</option>
            </select>

            {selectedPlans.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Activate Selected
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Deactivate Selected
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <PlanTable
            plans={filteredAndSortedPlans}
            selectedPlans={selectedPlans}
            sortConfig={sortConfig}
            onSort={handleSort}
            onEdit={(plan) => {
              setEditingPlan(plan);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onSelectPlan={handleSelectPlan}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlans.includes(plan.id)}
              onSelect={handleSelectPlan}
              onEdit={(plan) => {
                setEditingPlan(plan);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <PlanForm
          plan={editingPlan}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingPlan(undefined);
          }}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this plan? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};