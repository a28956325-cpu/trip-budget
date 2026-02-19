import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

import ReceiptUploader from '../components/ReceiptUploader';
import SplitSelector from '../components/SplitSelector';
import Toast from '../components/Toast';
import { Trip, Expense, ExpenseCategory, Split, ParsedReceipt } from '../types';
import { storage } from '../utils/storage';
import { generateId } from '../utils/helpers';
import { categories } from '../utils/categories';
import { useI18n } from '../contexts/I18nContext';

const AddExpense: React.FC = () => {
  const { id, expenseId } = useParams<{ id: string; expenseId?: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  
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

  const [splitMethod, setSplitMethod] = useState<'equal' | 'exact' | 'percentage' | 'items'>('equal');
  const [splits, setSplits] = useState<Split[]>([]);

  useEffect(() => {
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
    
    loadTrip();
  }, [id, expenseId, navigate]);

  const handleReceiptUpload = (
    receiptUrl: string, 
    receiptType: 'image' | 'pdf', 
    parsedData?: ParsedReceipt
  ) => {
    const newFormData: Partial<typeof formData> = {
      receiptUrl,
      receiptType,
      ocrText: parsedData?.rawText || ''
    };
    
    const newAutoFilledFields = new Set<string>();
    const detectedFields: string[] = [];
    
    if (parsedData) {
      // Auto-fill amount if detected with reasonable confidence
      if (parsedData.amount && parsedData.confidence.amount !== 'none') {
        newFormData.amount = parsedData.amount.toString();
        newAutoFilledFields.add('amount');
        detectedFields.push(`Amount: ${parsedData.amount}`);
      }
      
      // Auto-fill category if detected with reasonable confidence
      if (parsedData.category && parsedData.confidence.category !== 'none') {
        newFormData.category = parsedData.category;
        newAutoFilledFields.add('category');
        detectedFields.push(`Category: ${parsedData.category}`);
      }
      
      // Auto-fill description if detected
      if (parsedData.description && parsedData.confidence.description !== 'none') {
        newFormData.description = parsedData.description;
        newAutoFilledFields.add('description');
        detectedFields.push(`Merchant: ${parsedData.description}`);
      }
      
      // Auto-fill date if detected
      if (parsedData.date && parsedData.confidence.date !== 'none') {
        newFormData.date = parsedData.date;
        newAutoFilledFields.add('date');
        detectedFields.push(`Date: ${parsedData.date}`);
      }
    }
    
    setFormData(prev => ({ ...prev, ...newFormData }));
    setAutoFilledFields(newAutoFilledFields);
    
    if (detectedFields.length > 0) {
      setToast({ 
        message: `✨ Auto-detected: ${detectedFields.join(', ')}. You can edit if needed.`, 
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
    return <Layout><div>{t('common.loading')}</div></Layout>;
  }

  if (trip.people.length === 0) {
    return (
      <Layout title={expenseId ? t('expense.edit') : t('expense.add')} backTo={`/trip/${id}`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('people.noPeople')}</h3>
            <p className="text-gray-600 mb-4">
              {t('people.noPeople')}
            </p>
            <button
              onClick={() => navigate(`/trip/${id}/people`)}
              className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              {t('people.addPerson')}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={expenseId ? t('expense.edit') : t('expense.add')} backTo={`/trip/${id}`}>
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('expense.description')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('expense.description')} *
                  {autoFilledFields.has('description') && (
                    <span className="ml-2 text-xs text-blue-600 font-normal">{t('expense.autoDetected')}</span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    setAutoFilledFields(prev => {
                      const next = new Set(prev);
                      next.delete('description');
                      return next;
                    });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    autoFilledFields.has('description') ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                  }`}
                  placeholder="Dinner at restaurant"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('expense.amount')} ({trip.currency}) *
                    {autoFilledFields.has('amount') && (
                      <span className="ml-2 text-xs text-blue-600 font-normal">{t('expense.autoDetected')}</span>
                    )}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => {
                      setFormData({ ...formData, amount: e.target.value });
                      setAutoFilledFields(prev => {
                        const next = new Set(prev);
                        next.delete('amount');
                        return next;
                      });
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      autoFilledFields.has('amount') ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('expense.date')} *
                    {autoFilledFields.has('date') && (
                      <span className="ml-2 text-xs text-blue-600 font-normal">{t('expense.autoDetected')}</span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => {
                      setFormData({ ...formData, date: e.target.value });
                      setAutoFilledFields(prev => {
                        const next = new Set(prev);
                        next.delete('date');
                        return next;
                      });
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      autoFilledFields.has('date') ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('expense.category')} *
                  {autoFilledFields.has('category') && (
                    <span className="ml-2 text-xs text-blue-600 font-normal">{t('expense.autoDetected')}</span>
                  )}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, category: cat.id });
                        setAutoFilledFields(prev => {
                          const next = new Set(prev);
                          next.delete('category');
                          return next;
                        });
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.category === cat.id
                          ? autoFilledFields.has('category')
                            ? 'border-blue-500 bg-blue-100'
                            : 'border-primary-500 bg-primary-50'
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
                  {t('expense.paidBy')} *
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
                  {t('expense.notes')}
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('expense.uploadReceipt')}</h2>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('expense.splitMethod')}</h2>
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
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              {expenseId ? t('expense.edit') : t('expense.add')}
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
