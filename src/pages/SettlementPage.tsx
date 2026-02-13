import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PersonAvatar from '../components/PersonAvatar';
import { Trip } from '../types';
import { storage } from '../utils/storage';
import { calculateBalances, calculateSettlements } from '../utils/settlement';
import { formatCurrency } from '../utils/helpers';

const SettlementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);

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

  if (!trip) {
    return <Layout><div>Loading...</div></Layout>;
  }

  if (trip.people.length === 0 || trip.expenses.length === 0) {
    return (
      <Layout title="Settlement" backTo={`/trip/${id}`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {trip.people.length === 0 ? 'No People Added' : 'No Expenses Yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {trip.people.length === 0 
                ? 'Add people to your trip first'
                : 'Add expenses to calculate settlements'
              }
            </p>
            <button
              onClick={() => navigate(trip.people.length === 0 ? `/trip/${id}/people` : `/trip/${id}/expense/new`)}
              className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              {trip.people.length === 0 ? 'Add People' : 'Add Expense'}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const balances = calculateBalances(trip);
  const settlements = calculateSettlements(trip);

  const balanceArray = Array.from(balances.entries()).map(([personId, balance]) => ({
    person: trip.people.find(p => p.id === personId)!,
    balance
  })).sort((a, b) => b.balance - a.balance);

  return (
    <Layout title="Settlement" backTo={`/trip/${id}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Balance Overview */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Balance Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {balanceArray.map(({ person, balance }) => (
              <div
                key={person.id}
                className={`p-4 rounded-lg border-2 ${
                  balance > 0.01 
                    ? 'border-green-200 bg-green-50'
                    : balance < -0.01
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <PersonAvatar person={person} size="sm" />
                  <span className="font-semibold text-gray-900">{person.name}</span>
                </div>
                
                <div className="ml-11">
                  {balance > 0.01 ? (
                    <div>
                      <p className="text-sm text-gray-600">Should receive:</p>
                      <p className="text-lg font-bold text-green-700">
                        {formatCurrency(balance, trip.currency)}
                      </p>
                    </div>
                  ) : balance < -0.01 ? (
                    <div>
                      <p className="text-sm text-gray-600">Should pay:</p>
                      <p className="text-lg font-bold text-red-700">
                        {formatCurrency(Math.abs(balance), trip.currency)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600">Status:</p>
                      <p className="text-lg font-bold text-gray-700">Settled ✓</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settlement Plan */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Simplified Settlement Plan</h2>
          <p className="text-sm text-gray-600 mb-6">
            Minimum number of transactions to settle all debts
          </p>

          {settlements.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">All Settled!</h3>
              <p className="text-gray-600">Everyone is even, no transactions needed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {settlements.map((settlement, index) => {
                const fromPerson = trip.people.find(p => p.id === settlement.from)!;
                const toPerson = trip.people.find(p => p.id === settlement.to)!;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <PersonAvatar person={fromPerson} size="md" showName />
                      
                      <div className="flex items-center space-x-2">
                        <div className="hidden sm:block w-16 h-0.5 bg-gradient-to-r from-gray-400 to-primary-400"></div>
                        <div className="text-2xl">→</div>
                        <div className="hidden sm:block w-16 h-0.5 bg-gradient-to-r from-primary-400 to-green-400"></div>
                      </div>
                      
                      <PersonAvatar person={toPerson} size="md" showName />
                    </div>

                    <div className="ml-4 text-right">
                      <p className="text-sm text-gray-600">Pays</p>
                      <p className="text-xl font-bold text-primary-700">
                        {formatCurrency(settlement.amount, trip.currency)}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Tip</h4>
                    <p className="text-sm text-blue-800">
                      This settlement plan minimizes the number of transactions needed. 
                      Only {settlements.length} transaction{settlements.length !== 1 ? 's' : ''} required to settle all debts!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl p-6">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-primary-100 text-sm mb-1">Total Expenses</p>
            <p className="text-2xl font-bold">
              {formatCurrency(trip.expenses.reduce((sum, e) => sum + e.amount, 0), trip.currency)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
            <div className="text-3xl mb-2">🔄</div>
            <p className="text-green-100 text-sm mb-1">Transactions Needed</p>
            <p className="text-2xl font-bold">{settlements.length}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-purple-100 text-sm mb-1">People Settled</p>
            <p className="text-2xl font-bold">
              {balanceArray.filter(b => Math.abs(b.balance) < 0.01).length} / {trip.people.length}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettlementPage;
