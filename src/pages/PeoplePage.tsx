import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PersonAvatar from '../components/PersonAvatar';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { Trip, Person } from '../types';
import { storage } from '../utils/storage';
import { generateId, getAvatarColor } from '../utils/helpers';
import { getPersonBalance } from '../utils/settlement';
import { formatCurrency } from '../utils/helpers';
import { useI18n } from '../contexts/I18nContext';

const PeoplePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [newPersonName, setNewPersonName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
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
    
    loadTrip();
  }, [id, navigate]);

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trip || !newPersonName.trim()) {
      setToast({ message: 'Please enter a name', type: 'error' });
      return;
    }

    const newPerson: Person = {
      id: generateId(),
      name: newPersonName.trim(),
      color: getAvatarColor(trip.people.length)
    };

    const updatedTrip = {
      ...trip,
      people: [...trip.people, newPerson]
    };

    storage.saveTrip(updatedTrip);
    setTrip(updatedTrip);
    setNewPersonName('');
    setToast({ message: 'Person added successfully!', type: 'success' });
  };

  const handleDeletePerson = (personId: string) => {
    if (!trip) return;

    // Check if person has any expenses
    const hasExpenses = trip.expenses.some(
      expense => 
        expense.paidBy === personId || 
        expense.splits.some(split => split.personId === personId)
    );

    if (hasExpenses) {
      setToast({ 
        message: 'Cannot remove person with assigned expenses', 
        type: 'error' 
      });
      setDeleteConfirm(null);
      return;
    }

    const updatedTrip = {
      ...trip,
      people: trip.people.filter(p => p.id !== personId)
    };

    storage.saveTrip(updatedTrip);
    setTrip(updatedTrip);
    setDeleteConfirm(null);
    setToast({ message: 'Person removed', type: 'success' });
  };

  if (!trip) {
    return <Layout><div>{t('common.loading')}</div></Layout>;
  }

  return (
    <Layout title={t('people.title')} backTo={`/trip/${id}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Add Person Form */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('people.addPerson')}</h2>
          <form onSubmit={handleAddPerson} className="flex space-x-3">
            <input
              type="text"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              placeholder={t('people.name')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              {t('people.addPerson')}
            </button>
          </form>
        </div>

        {/* People List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('people.title')} ({trip.people.length})
          </h2>

          {trip.people.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">👥</div>
              <p>{t('people.noPeople')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trip.people.map(person => {
                const balance = getPersonBalance(trip, person.id);
                const hasExpenses = trip.expenses.some(
                  expense => 
                    expense.paidBy === person.id || 
                    expense.splits.some(split => split.personId === person.id)
                );

                return (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <PersonAvatar person={person} size="lg" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{person.name}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm">
                          <span className="text-gray-600">
                            {t('people.totalPaid')}: <span className="font-medium text-gray-900">
                              {formatCurrency(balance.paid, trip.currency)}
                            </span>
                          </span>
                          <span className="text-gray-600">
                            {t('people.totalOwed')}: <span className="font-medium text-gray-900">
                              {formatCurrency(balance.owed, trip.currency)}
                            </span>
                          </span>
                          <span className={`font-semibold ${
                            balance.balance > 0 
                              ? 'text-green-600' 
                              : balance.balance < 0 
                              ? 'text-red-600' 
                              : 'text-gray-600'
                          }`}>
                            {t('people.balance')}: {formatCurrency(Math.abs(balance.balance), trip.currency)}
                            {balance.balance > 0 ? ` (${t('settlement.isOwed')})` : balance.balance < 0 ? ` (${t('settlement.owes')})` : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setDeleteConfirm(person.id)}
                      disabled={hasExpenses}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        hasExpenses
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                      title={hasExpenses ? t('people.cannotRemove') : t('common.delete')}
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">ℹ️</div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">{t('people.cannotRemove')}</h4>
              <p className="text-sm text-blue-800">
                {t('people.cannotRemove')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title={t('common.delete')}
        message={t('people.cannotRemove')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        onConfirm={() => deleteConfirm && handleDeletePerson(deleteConfirm)}
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

export default PeoplePage;
