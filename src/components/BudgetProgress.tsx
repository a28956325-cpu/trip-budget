import React from 'react';
import { ExpenseCategory } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { categories } from '../utils/categories';

interface BudgetProgressProps {
  category?: ExpenseCategory;
  budget: number;
  spent: number;
  showWarning?: boolean;
}

const BudgetProgress: React.FC<BudgetProgressProps> = ({
  category,
  budget,
  spent,
  showWarning = true
}) => {
  const { t } = useI18n();
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = Math.max(budget - spent, 0);
  const isOverBudget = spent > budget;

  const getProgressColor = () => {
    if (isOverBudget || percentage >= 100) return 'bg-red-500';
    if (percentage >= 90) return 'bg-red-400';
    if (percentage >= 70) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const getBackgroundColor = () => {
    if (isOverBudget || percentage >= 100) return 'bg-red-50';
    if (percentage >= 90) return 'bg-red-50';
    if (percentage >= 70) return 'bg-yellow-50';
    return 'bg-green-50';
  };

  const categoryInfo = category ? categories.find(c => c.id === category) : null;

  return (
    <div className={`rounded-lg p-4 ${getBackgroundColor()} border ${isOverBudget ? 'border-red-300' : 'border-gray-200'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {categoryInfo && (
            <span className="text-2xl">{categoryInfo.emoji}</span>
          )}
          <div>
            <h4 className="font-semibold text-gray-800">
              {categoryInfo ? t(`category.${category}` as any) : t('budget.setTotal')}
            </h4>
            {showWarning && isOverBudget && (
              <p className="text-sm text-red-600 font-medium">{t('budget.overBudget')}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-800">
            ${spent.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            / ${budget.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-300`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between text-sm">
        <div>
          <span className="text-gray-600">{t('budget.progress')}: </span>
          <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-800'}`}>
            {percentage.toFixed(1)}%
          </span>
        </div>
        <div>
          <span className="text-gray-600">{t('budget.remaining')}: </span>
          <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
            ${remaining.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Warning Message */}
      {showWarning && percentage >= 80 && !isOverBudget && (
        <div className="mt-2 text-sm text-yellow-700 bg-yellow-100 rounded px-2 py-1">
          {t('budget.warning', { percent: percentage.toFixed(0) })}
        </div>
      )}
    </div>
  );
};

export default BudgetProgress;
