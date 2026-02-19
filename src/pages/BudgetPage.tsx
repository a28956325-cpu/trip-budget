import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import BudgetProgress from '../components/BudgetProgress';
import { Trip, ExpenseCategory } from '../types';
import { storage } from '../utils/storage';
import { useI18n } from '../contexts/I18nContext';
import { categories } from '../utils/categories';

const BudgetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [totalBudget, setTotalBudget] = useState('');
  const [categoryBudgets, setCategoryBudgets] = useState<Record<ExpenseCategory, string>>({
    food: '',
    clothing: '',
    accommodation: '',
    transport: '',
    education: '',
    entertainment: '',
    other: ''
  });

  useEffect(() => {
    if (id) {
      const loadedTrip = storage.getTrip(id);
      if (loadedTrip) {
        setTrip(loadedTrip);
        if (loadedTrip.budget) {
          setTotalBudget(loadedTrip.budget.total?.toString() || '');
          if (loadedTrip.budget.categories) {
            const newCategoryBudgets = { ...categoryBudgets };
            Object.entries(loadedTrip.budget.categories).forEach(([cat, amount]) => {
              if (amount) {
                newCategoryBudgets[cat as ExpenseCategory] = amount.toString();
              }
            });
            setCategoryBudgets(newCategoryBudgets);
          }
        }
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  if (!trip) return null;

  const calculateCategorySpent = (category: ExpenseCategory): number => {
    return trip.expenses
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const calculateTotalSpent = (): number => {
    return trip.expenses.reduce((sum, e) => sum + e.amount, 0);
  };

  const handleSave = () => {
    const updatedTrip = {
      ...trip,
      budget: {
        total: totalBudget ? parseFloat(totalBudget) : undefined,
        categories: Object.entries(categoryBudgets).reduce((acc, [cat, amount]) => {
          if (amount) {
            acc[cat as ExpenseCategory] = parseFloat(amount);
          }
          return acc;
        }, {} as Record<ExpenseCategory, number>)
      }
    };
    
    storage.updateTrip(updatedTrip);
    setTrip(updatedTrip);
    setEditMode(false);
  };

  const totalSpent = calculateTotalSpent();
  const totalBudgetNum = parseFloat(totalBudget) || 0;

  return (
    <Layout title={t('budget.title')} backTo={`/trip/${id}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('budget.title')}</h1>
            <p className="text-gray-600 mt-1">Set and track your budget for this trip</p>
          </div>
          <button
            onClick={() => editMode ? handleSave() : setEditMode(true)}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            {editMode ? t('common.save') : t('common.edit')}
          </button>
        </div>

        {/* Total Budget */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('budget.setTotal')}</h2>
          
          {editMode ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Trip Budget ({trip.currency})
              </label>
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          ) : null}

          {totalBudgetNum > 0 && (
            <BudgetProgress
              budget={totalBudgetNum}
              spent={totalSpent}
              showWarning={true}
            />
          )}

          {!totalBudgetNum && !editMode && (
            <p className="text-gray-500 text-center py-4">
              No total budget set. Click Edit to set one.
            </p>
          )}
        </div>

        {/* Category Budgets */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('budget.setCategory')}</h2>
          
          <div className="space-y-4">
            {categories.map((category) => {
              const budgetAmount = parseFloat(categoryBudgets[category.id]) || 0;
              const spentAmount = calculateCategorySpent(category.id);
              
              return (
                <div key={category.id}>
                  {editMode && (
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t(`category.${category.id}` as any)} Budget ({trip.currency})
                      </label>
                      <input
                        type="number"
                        value={categoryBudgets[category.id]}
                        onChange={(e) => setCategoryBudgets({
                          ...categoryBudgets,
                          [category.id]: e.target.value
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  )}
                  
                  {budgetAmount > 0 && (
                    <BudgetProgress
                      category={category.id}
                      budget={budgetAmount}
                      spent={spentAmount}
                      showWarning={true}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {!editMode && Object.values(categoryBudgets).every(v => !v) && (
            <p className="text-gray-500 text-center py-4">
              No category budgets set. Click Edit to set them.
            </p>
          )}
        </div>

        {/* Budget Tips */}
        <div className="bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl p-6 border border-accent-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Budget Tips</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 mt-1">•</span>
              <span>Set realistic budgets based on your travel destination and style</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 mt-1">•</span>
              <span>Add 10-20% buffer for unexpected expenses</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 mt-1">•</span>
              <span>Track daily to avoid overspending in any category</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 mt-1">•</span>
              <span>Adjust budgets mid-trip if needed based on actual spending patterns</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default BudgetPage;
