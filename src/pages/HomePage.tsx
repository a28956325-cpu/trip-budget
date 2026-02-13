import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { Trip } from '../types';
import { storage } from '../utils/storage';
import { generateId } from '../utils/helpers';
import { formatDate } from '../utils/helpers';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    currency: 'USD',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = () => {
    const allTrips = storage.getAllTrips();
    setTrips(allTrips.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setToast({ message: 'Please enter a trip name', type: 'error' });
      return;
    }

    const newTrip: Trip = {
      id: generateId(),
      name: formData.name,
      description: formData.description,
      currency: formData.currency,
      startDate: formData.startDate,
      endDate: formData.endDate,
      createdAt: new Date().toISOString(),
      people: [],
      expenses: []
    };

    storage.saveTrip(newTrip);
    setToast({ message: 'Trip created successfully!', type: 'success' });
    setShowCreateForm(false);
    setFormData({
      name: '',
      description: '',
      currency: 'USD',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    });
    loadTrips();
  };

  const handleDeleteTrip = (id: string) => {
    storage.deleteTrip(id);
    setToast({ message: 'Trip deleted', type: 'success' });
    setDeleteConfirm(null);
    loadTrips();
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">✈️💰</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            TravelSplit
          </h1>
          <p className="text-xl text-gray-600 mb-1">旅行分帳神器</p>
          <p className="text-sm text-gray-500">
            Track expenses, split bills, settle debts — all in one place
          </p>
        </div>

        {/* Create Trip Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            + Create New Trip
          </button>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowCreateForm(false)}></div>
              
              <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Trip</h2>
                
                <form onSubmit={handleCreateTrip} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trip Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Summer Vacation 2024"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Fun trip with friends"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="TWD">TWD - Taiwan Dollar</option>
                      <option value="CNY">CNY - Chinese Yuan</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Create Trip
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Trips List */}
        {trips.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No trips yet</h3>
            <p className="text-gray-500">Create your first trip to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(trip => {
              const totalExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
              
              return (
                <div
                  key={trip.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden cursor-pointer group"
                  onClick={() => navigate(`/trip/${trip.id}`)}
                >
                  <div className="h-32 bg-gradient-to-br from-primary-400 to-primary-600 p-6 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">✈️</div>
                      <h3 className="text-xl font-bold text-white truncate">{trip.name}</h3>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {trip.description || 'No description'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>📅 {formatDate(trip.startDate)}</span>
                      <span>→</span>
                      <span>{formatDate(trip.endDate)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm mb-4">
                      <div>
                        <span className="text-gray-600">Expenses:</span>
                        <span className="ml-1 font-semibold text-gray-900">{trip.expenses.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">People:</span>
                        <span className="ml-1 font-semibold text-gray-900">{trip.people.length}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-xs text-gray-500">Total</span>
                        <p className="text-lg font-bold text-primary-600">
                          {trip.currency} {totalExpenses.toFixed(2)}
                        </p>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(trip.id);
                        }}
                        className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-md hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title="Delete Trip"
        message="Are you sure you want to delete this trip? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => deleteConfirm && handleDeleteTrip(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* Toast Notifications */}
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

export default HomePage;
