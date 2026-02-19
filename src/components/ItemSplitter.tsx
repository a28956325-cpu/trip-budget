import React, { useState } from 'react';
import { Person, ExpenseItem } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { generateId } from '../utils/helpers';
import PersonAvatar from './PersonAvatar';

interface ItemSplitterProps {
  people: Person[];
  items: ExpenseItem[];
  totalAmount: number;
  onItemsChange: (items: ExpenseItem[]) => void;
}

const ItemSplitter: React.FC<ItemSplitterProps> = ({
  people,
  items,
  totalAmount,
  onItemsChange
}) => {
  const { t } = useI18n();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    amount: '',
    splitAmong: [] as string[]
  });

  const addItem = () => {
    if (!newItem.name || !newItem.amount || newItem.splitAmong.length === 0) {
      return;
    }

    const item: ExpenseItem = {
      id: generateId(),
      name: newItem.name,
      amount: parseFloat(newItem.amount),
      splitAmong: newItem.splitAmong
    };

    onItemsChange([...items, item]);
    setNewItem({ name: '', amount: '', splitAmong: [] });
    setShowAddForm(false);
  };

  const removeItem = (itemId: string) => {
    onItemsChange(items.filter(item => item.id !== itemId));
  };

  const togglePersonForItem = (itemId: string, personId: string) => {
    onItemsChange(
      items.map(item => {
        if (item.id === itemId) {
          const splitAmong = item.splitAmong.includes(personId)
            ? item.splitAmong.filter(id => id !== personId)
            : [...item.splitAmong, personId];
          return { ...item, splitAmong };
        }
        return item;
      })
    );
  };

  const togglePersonForNewItem = (personId: string) => {
    setNewItem(prev => ({
      ...prev,
      splitAmong: prev.splitAmong.includes(personId)
        ? prev.splitAmong.filter(id => id !== personId)
        : [...prev.splitAmong, personId]
    }));
  };

  const calculateItemsTotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculatePersonTotal = (personId: string) => {
    return items.reduce((sum, item) => {
      if (item.splitAmong.includes(personId)) {
        return sum + (item.amount / item.splitAmong.length);
      }
      return sum;
    }, 0);
  };

  const itemsTotal = calculateItemsTotal();
  const totalMismatch = Math.abs(itemsTotal - totalAmount) > 0.01;

  const splitRemaining = () => {
    const remaining = totalAmount - itemsTotal;
    if (remaining <= 0 || people.length === 0) return;

    const item: ExpenseItem = {
      id: generateId(),
      name: t('items.splitRemaining'),
      amount: remaining,
      splitAmong: people.map(p => p.id)
    };

    onItemsChange([...items, item]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{t('expense.splitByItems')}</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          {t('items.addItem')}
        </button>
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {items.map((item) => {
          const perPerson = item.amount / item.splitAmong.length;
          return (
            <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <span className="text-primary-600 font-semibold">${item.amount.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {t('items.splitAmong')}: {item.splitAmong.length} {item.splitAmong.length === 1 ? 'person' : 'people'} (${perPerson.toFixed(2)} each)
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-700 transition-colors p-1"
                  title={t('items.removeItem')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {people.map(person => {
                  const isSelected = item.splitAmong.includes(person.id);
                  return (
                    <button
                      key={person.id}
                      onClick={() => togglePersonForItem(item.id, person.id)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-primary-100 border-primary-300 text-primary-800'
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <PersonAvatar person={person} size="sm" />
                      <span className="text-sm font-medium">{person.name}</span>
                      {isSelected && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add item form */}
      {showAddForm && (
        <div className="bg-primary-50 rounded-lg p-4 border-2 border-primary-300">
          <h4 className="font-medium text-gray-800 mb-3">{t('items.addItem')}</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('items.itemName')}
              </label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Xiao Long Bao"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('items.itemAmount')}
              </label>
              <input
                type="number"
                value={newItem.amount}
                onChange={(e) => setNewItem(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('items.splitAmong')}
              </label>
              <div className="flex flex-wrap gap-2">
                {people.map(person => {
                  const isSelected = newItem.splitAmong.includes(person.id);
                  return (
                    <button
                      key={person.id}
                      onClick={() => togglePersonForNewItem(person.id)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-primary-100 border-primary-300 text-primary-800'
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <PersonAvatar person={person} size="sm" />
                      <span className="text-sm font-medium">{person.name}</span>
                      {isSelected && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={addItem}
                disabled={!newItem.name || !newItem.amount || newItem.splitAmong.length === 0}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t('common.save')}
              </button>
              <button
                onClick={() => {
                  setNewItem({ name: '', amount: '', splitAmong: [] });
                  setShowAddForm(false);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">{t('items.summary')}</span>
          {totalMismatch && (
            <button
              onClick={splitRemaining}
              className="px-3 py-1 text-sm bg-accent-100 text-accent-700 rounded-lg hover:bg-accent-200 transition-colors"
            >
              {t('items.splitRemaining')} (${(totalAmount - itemsTotal).toFixed(2)})
            </button>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          {people.map(person => {
            const total = calculatePersonTotal(person.id);
            if (total === 0) return null;
            return (
              <div key={person.id} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <PersonAvatar person={person} size="sm" />
                  <span className="text-gray-800">{person.name}</span>
                </div>
                <span className="font-semibold text-primary-600">${total.toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center py-2 border-t">
          <span className="font-semibold text-gray-800">{t('expense.total')}</span>
          <div className="text-right">
            <div className={`font-bold text-lg ${totalMismatch ? 'text-red-600' : 'text-primary-600'}`}>
              ${itemsTotal.toFixed(2)}
            </div>
            {totalMismatch && (
              <div className="text-sm text-red-600">
                {t('items.totalMismatch')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemSplitter;
