import React from 'react';
import { Expense, Person } from '../types';
import CategoryIcon from './CategoryIcon';
import PersonAvatar from './PersonAvatar';
import { formatCurrency, formatDate } from '../utils/helpers';

interface ExpenseCardProps {
  expense: Expense;
  people: Person[];
  currency: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ 
  expense, 
  people, 
  currency,
  onEdit, 
  onDelete 
}) => {
  const payer = people.find(p => p.id === expense.paidBy);
  const splitPeople = expense.splits
    .map(s => people.find(p => p.id === s.personId))
    .filter(Boolean) as Person[];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <CategoryIcon category={expense.category} size="sm" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {expense.description}
              </h3>
              <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
            </div>
            <div className="text-right ml-4">
              <p className="text-xl font-bold text-primary-600">
                {formatCurrency(expense.amount, currency)}
              </p>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Paid by:</span>
              {payer && <PersonAvatar person={payer} size="sm" showName />}
            </div>
            
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">Split:</span>
              <div className="flex -space-x-2">
                {splitPeople.slice(0, 3).map(person => (
                  <div key={person.id} className="relative">
                    <PersonAvatar person={person} size="sm" />
                  </div>
                ))}
                {splitPeople.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                    +{splitPeople.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {expense.notes && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{expense.notes}</p>
          )}
          
          {(onEdit || onDelete) && (
            <div className="mt-3 flex space-x-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="flex-1 px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-md hover:bg-primary-100 transition-colors"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="flex-1 px-3 py-1.5 bg-red-50 text-red-700 text-sm font-medium rounded-md hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
