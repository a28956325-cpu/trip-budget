import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import SummaryCard from '../components/SummaryCard';
import ExpenseCard from '../components/ExpenseCard';
import { Trip } from '../types';
import { storage } from '../utils/storage';
import { formatCurrency } from '../utils/helpers';
import { getCategoryName, getCategoryColor } from '../utils/categories';
import { getPersonBalance } from '../utils/settlement';
import { useI18n } from '../contexts/I18nContext';

const TripDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    if (id) {
      const loadedTrip = storage.getTrip(id);
      if (loadedTrip) {
        setTrip(loadedTrip);
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  if (!trip) {
    return <Layout><div>{t('common.loading')}</div></Layout>;
  }

  const totalExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
  const averagePerPerson = trip.people.length > 0 ? totalExpenses / trip.people.length : 0;

  // Category breakdown data
  const categoryData = Array.from(
    trip.expenses.reduce((map, expense) => {
      const current = map.get(expense.category) || 0;
      map.set(expense.category, current + expense.amount);
      return map;
    }, new Map<string, number>())
  ).map(([category, amount]) => ({
    name: getCategoryName(category as any).split(' ')[0],
    value: amount,
    color: getCategoryColor(category as any)
  }));

  // Per-person spending data
  const personData = trip.people.map(person => {
    const balance = getPersonBalance(trip, person.id);
    return {
      name: person.name,
      paid: balance.paid,
      owed: balance.owed,
      color: person.color
    };
  });

  const recentExpenses = [...trip.expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <Layout title={trip.name} backTo="/">
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title={t('dashboard.totalExpenses')}
            value={formatCurrency(totalExpenses, trip.currency)}
            icon="💰"
            color="primary"
          />
          <SummaryCard
            title={t('dashboard.numExpenses')}
            value={trip.expenses.length}
            icon="📝"
            color="accent"
          />
          <SummaryCard
            title={t('dashboard.numPeople')}
            value={trip.people.length}
            icon="👥"
            color="success"
          />
          <SummaryCard
            title={t('dashboard.avgPerPerson')}
            value={formatCurrency(averagePerPerson, trip.currency)}
            icon="📊"
            subtitle={trip.people.length > 0 ? '' : 'Add people first'}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.categoryBreakdown')}</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number, trip.currency)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p>{t('expense.noExpenses')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Per-Person Spending */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.perPersonSpending')}</h3>
            {personData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={personData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number, trip.currency)} />
                  <Legend />
                  <Bar dataKey="paid" fill="#0ea5e9" name="Paid" />
                  <Bar dataKey="owed" fill="#f59e0b" name="Owed" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">👥</div>
                  <p>{t('people.noPeople')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.recentExpenses')}</h3>
            <Link
              to={`/trip/${trip.id}/expenses`}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All →
            </Link>
          </div>
          
          {recentExpenses.length > 0 ? (
            <div className="space-y-4">
              {recentExpenses.map(expense => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  people={trip.people}
                  currency={trip.currency}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">💸</div>
              <p>{t('expense.noExpenses')}</p>
              <button
                onClick={() => navigate(`/trip/${trip.id}/expense/new`)}
                className="mt-4 px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t('expense.add')}
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            to={`/trip/${trip.id}/expense/new`}
            className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="text-3xl mb-2">➕</div>
            <h4 className="font-semibold text-lg">{t('expense.add')}</h4>
          </Link>

          <Link
            to={`/trip/${trip.id}/people`}
            className="bg-gradient-to-br from-accent-500 to-accent-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="text-3xl mb-2">👥</div>
            <h4 className="font-semibold text-lg">{t('people.title')}</h4>
            <p className="text-sm text-accent-100 mt-1">{t('nav.people')}</p>
          </Link>

          <Link
            to={`/trip/${trip.id}/budget`}
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="text-3xl mb-2">💰</div>
            <h4 className="font-semibold text-lg">{t('budget.title')}</h4>
            <p className="text-sm text-orange-100 mt-1">Track spending</p>
          </Link>

          <Link
            to={`/trip/${trip.id}/settlement`}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="text-3xl mb-2">💵</div>
            <h4 className="font-semibold text-lg">{t('settlement.title')}</h4>
            <p className="text-sm text-green-100 mt-1">{t('nav.settlement')}</p>
          </Link>

          <Link
            to={`/trip/${trip.id}/export`}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="text-3xl mb-2">📥</div>
            <h4 className="font-semibold text-lg">{t('export.title')}</h4>
            <p className="text-sm text-purple-100 mt-1">{t('nav.export')}</p>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default TripDashboard;
