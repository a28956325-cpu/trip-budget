import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ExpenseCard from '../components/ExpenseCard';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { Trip, Expense } from '../types';
import { storage } from '../utils/storage';
import { formatCurrency } from '../utils/helpers';
import { categories } from '../utils/categories';

const ExpensesList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [filters, setFilters] = useState({
    category: 'all',
    person: 'all',
    sortBy: 'date-desc' as 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'
  });

  useEffect(() => {
    loadTrip();
  }, [id]);

  useEffect(() => {
    if (trip) {
      applyFilters();
    }
  }, [trip, filters]);

  const loadTrip = () => {
    if (id) {
      const loadedTrip = storage.getTrip(id);
      if (loadedTrip) {
        setTrip(loadedTrip);
      } else {
        navigate('/');
      }
    }
  };

  const applyFilters = () => {
    if (!trip) return;

    let expenses = [...trip.expenses];

    // Filter by category
    if (filters.category !== 'all') {
      expenses = expenses.filter(e => e.category === filters.category);
    }

    // Filter by person
    if (filters.person !== 'all') {
      expenses = expenses.filter(e => 
        e.paidBy === filters.person || 
        e.splits.some(s => s.personId === filters.person)
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'date-desc':
        expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'date-asc':
        expenses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'amount-desc':
        expenses.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount-asc':
        expenses.sort((a, b) => a.amount - b.amount);
        break;
    }

    setFilteredExpenses(expenses);
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (!trip) return;

    const updatedTrip = {
      ...trip,
      expenses: trip.expenses.filter(e => e.id !== expenseId)
    };

    storage.saveTrip(updatedTrip);
    setTrip(updatedTrip);
    setDeleteConfirm(null);
    setToast({ message: 'Expense deleted', type: 'success' });
  };

  if (!trip) {
    return <Layout><div>Loading...</div></Layout>;
  }

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Layout title="All Expenses" backTo={`/trip/${id}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters & Sort</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Person
              </label>
              <select
                value={filters.person}
                onChange={(e) => setFilters({ ...filters, person: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All People</option>
                {trip.people.map(person => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>
                <option value="amount-desc">Amount (High to Low)</option>
                <option value="amount-asc">Amount (Low to High)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredExpenses.length} of {trip.expenses.length} expenses
            </div>
            <button
              onClick={() => setFilters({ category: 'all', person: 'all', sortBy: 'date-desc' })}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No expenses found</h3>
            <p className="text-gray-500 mb-4">
              {trip.expenses.length === 0 
                ? 'Start by adding your first expense'
                : 'Try adjusting your filters'
              }
            </p>
            {trip.expenses.length === 0 && (
              <button
                onClick={() => navigate(`/trip/${id}/expense/new`)}
                className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add Expense
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {filteredExpenses.map(expense => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  people={trip.people}
                  currency={trip.currency}
                  onEdit={() => navigate(`/trip/${id}/expense/${expense.id}/edit`)}
                  onDelete={() => setDeleteConfirm(expense.id)}
                />
              ))}
            </div>

            {/* Total */}
            <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-700">
                  Total ({filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''})
                </span>
                <span className="text-2xl font-bold text-primary-700">
                  {formatCurrency(totalAmount, trip.currency)}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Add Button */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => navigate(`/trip/${id}/expense/new`)}
            className="w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-primary-700 transition-all transform hover:scale-110 flex items-center justify-center text-2xl"
          >
            +
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => deleteConfirm && handleDeleteExpense(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  );
};

export default ExpensesList;
