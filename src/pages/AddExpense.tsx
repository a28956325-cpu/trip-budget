import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

import ReceiptUploader from '../components/ReceiptUploader';
import SplitSelector from '../components/SplitSelector';
import Toast from '../components/Toast';
import { Trip, Expense, ExpenseCategory, Split } from '../types';
import { storage } from '../utils/storage';
import { generateId } from '../utils/helpers';
import { categories } from '../utils/categories';

const AddExpense: React.FC = () => {
  const { id, expenseId } = useParams<{ id: string; expenseId?: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'food' as ExpenseCategory,
    paidBy: '',
    notes: '',
    receiptUrl: '',
    receiptType: undefined as 'image' | 'pdf' | undefined,
    ocrText: ''
  });

  const [splitMethod, setSplitMethod] = useState<'equal' | 'exact' | 'percentage'>('equal');
  const [splits, setSplits] = useState<Split[]>([]);

  useEffect(() => {
    loadTrip();
  }, [id, expenseId]);

  const loadTrip = () => {
    if (id) {
      const loadedTrip = storage.getTrip(id);
      if (loadedTrip) {
        setTrip(loadedTrip);
        
        // If editing existing expense
        if (expenseId) {
          const expense = loadedTrip.expenses.find(e => e.id === expenseId);
          if (expense) {
            setFormData({
              description: expense.description,
              amount: expense.amount.toString(),
              date: expense.date,
              category: expense.category,
              paidBy: expense.paidBy,
              notes: expense.notes || '',
              receiptUrl: expense.receiptUrl || '',
              receiptType: expense.receiptType,
              ocrText: expense.ocrText || ''
            });
            setSplitMethod(expense.splitMethod);
            setSplits(expense.splits);
          }
        } else {
          // Set default payer to first person
          if (loadedTrip.people.length > 0) {
            setFormData(prev => ({ ...prev, paidBy: loadedTrip.people[0].id }));
          }
        }
      } else {
        navigate('/');
      }
    }
  };

  const handleReceiptUpload = (
    receiptUrl: string, 
    receiptType: 'image' | 'pdf', 
    ocrText?: string, 
    detectedAmount?: number
  ) => {
    setFormData(prev => ({
      ...prev,
      receiptUrl,
      receiptType,
      ocrText: ocrText || '',
      amount: detectedAmount ? detectedAmount.toString() : prev.amount
    }));
    
    if (detectedAmount) {
      setToast({ 
        message: `Detected amount: ${detectedAmount}. You can edit if needed.`, 
        type: 'success' 
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trip) return;

    // Validation
    if (!formData.description.trim()) {
      setToast({ message: 'Please enter a description', type: 'error' });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setToast({ message: 'Please enter a valid amount', type: 'error' });
      return;
    }

    if (!formData.paidBy) {
      setToast({ message: 'Please select who paid', type: 'error' });
      return;
    }

    if (splits.length === 0) {
      setToast({ message: 'Please select at least one person to split with', type: 'error' });
      return;
    }

    // Validate split totals
    const splitTotal = splits.reduce((sum, s) => sum + s.amount, 0);
    if (Math.abs(splitTotal - amount) > 0.01) {
      setToast({ 
        message: `Split total (${splitTotal.toFixed(2)}) must equal expense amount (${amount.toFixed(2)})`, 
        type: 'error' 
      });
      return;
    }

    const expense: Expense = {
      id: expenseId || generateId(),
      description: formData.description.trim(),
      amount,
      currency: trip.currency,
      date: formData.date,
      category: formData.category,
      paidBy: formData.paidBy,
      splitMethod,
      splits,
      receiptUrl: formData.receiptUrl || undefined,
      receiptType: formData.receiptType,
      ocrText: formData.ocrText || undefined,
      notes: formData.notes.trim() || undefined,
      createdAt: expenseId 
        ? trip.expenses.find(e => e.id === expenseId)?.createdAt || new Date().toISOString()
        : new Date().toISOString()
    };

    const updatedExpenses = expenseId
      ? trip.expenses.map(e => e.id === expenseId ? expense : e)
      : [...trip.expenses, expense];

    const updatedTrip = {
      ...trip,
      expenses: updatedExpenses
    };

    storage.saveTrip(updatedTrip);
    setToast({ 
      message: expenseId ? 'Expense updated!' : 'Expense added!', 
      type: 'success' 
    });
    
    setTimeout(() => {
      navigate(`/trip/${id}`);
    }, 1000);
  };

  if (!trip) {
    return <Layout><div>Loading...</div></Layout>;
  }

  if (trip.people.length === 0) {
    return (
      <Layout title={expenseId ? 'Edit Expense' : 'Add Expense'} backTo={`/trip/${id}`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No People Added</h3>
            <p className="text-gray-600 mb-4">
              You need to add people to the trip before creating expenses.
            </p>
            <button
              onClick={() => navigate(`/trip/${id}/people`)}
              className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add People
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={expenseId ? 'Edit Expense' : 'Add Expense'} backTo={`/trip/${id}`}>
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Dinner at restaurant"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ({trip.currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.category === cat.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{cat.emoji}</div>
                        <div className="text-xs font-medium text-gray-700">
                          {cat.name.split(' ')[1]}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paid By *
                </label>
                <select
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select person</option>
                  {trip.people.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Receipt Upload */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Receipt</h2>
            <ReceiptUploader 
              onReceiptUpload={handleReceiptUpload}
              currentReceipt={formData.receiptUrl}
            />
            {formData.ocrText && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 mb-1">OCR Text Detected:</p>
                <p className="text-sm text-gray-700 line-clamp-3">{formData.ocrText}</p>
              </div>
            )}
          </div>

          {/* Split Configuration */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Split Expense</h2>
            <SplitSelector
              people={trip.people}
              totalAmount={parseFloat(formData.amount) || 0}
              splitMethod={splitMethod}
              splits={splits}
              onSplitMethodChange={setSplitMethod}
              onSplitsChange={setSplits}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/trip/${id}`)}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              {expenseId ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>

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

export default AddExpense;
