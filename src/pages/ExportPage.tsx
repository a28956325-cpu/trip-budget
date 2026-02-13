import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import { Trip } from '../types';
import { storage } from '../utils/storage';
import { exportToExcel } from '../utils/excel';
import { formatCurrency, formatDate } from '../utils/helpers';

const ExportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExport = () => {
    if (!trip) return;

    setIsExporting(true);
    
    try {
      exportToExcel(trip);
      setToast({ message: 'Excel file downloaded successfully!', type: 'success' });
    } catch (error) {
      console.error('Export error:', error);
      setToast({ message: 'Error exporting file. Please try again.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  if (!trip) {
    return <Layout><div>Loading...</div></Layout>;
  }

  const totalExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
  const averagePerPerson = trip.people.length > 0 ? totalExpenses / trip.people.length : 0;

  return (
    <Layout title="Export to Excel" backTo={`/trip/${id}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Export Header */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-3xl font-bold mb-2">Export Your Trip Data</h2>
          <p className="text-purple-100 mb-6">
            Download a comprehensive Excel report with all your expenses, balances, and settlements
          </p>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <span className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent"></div>
                <span>Exporting...</span>
              </span>
            ) : (
              '📥 Download Excel File'
            )}
          </button>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Report Preview</h3>
          
          <div className="space-y-6">
            {/* Summary Sheet Preview */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-6 bg-purple-500 rounded"></div>
                <h4 className="font-semibold text-gray-800">Sheet 1: Summary</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-600">Trip Name:</span>
                  <span className="text-gray-900">{trip.name}</span>
                  
                  <span className="font-medium text-gray-600">Currency:</span>
                  <span className="text-gray-900">{trip.currency}</span>
                  
                  <span className="font-medium text-gray-600">Dates:</span>
                  <span className="text-gray-900">
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </span>
                  
                  <span className="font-medium text-gray-600">Total Expenses:</span>
                  <span className="text-gray-900 font-semibold">
                    {formatCurrency(totalExpenses, trip.currency)}
                  </span>
                  
                  <span className="font-medium text-gray-600">Number of Expenses:</span>
                  <span className="text-gray-900">{trip.expenses.length}</span>
                  
                  <span className="font-medium text-gray-600">Number of People:</span>
                  <span className="text-gray-900">{trip.people.length}</span>
                  
                  <span className="font-medium text-gray-600">Average per Person:</span>
                  <span className="text-gray-900 font-semibold">
                    {formatCurrency(averagePerPerson, trip.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* All Expenses Sheet Preview */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-6 bg-blue-500 rounded"></div>
                <h4 className="font-semibold text-gray-800">Sheet 2: All Expenses</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  Complete list of {trip.expenses.length} expense{trip.expenses.length !== 1 ? 's' : ''} with:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Date, Description, Category</li>
                  <li>• Amount and Currency</li>
                  <li>• Paid By and Split Details</li>
                  <li>• Notes</li>
                </ul>
              </div>
            </div>

            {/* Per-Person Breakdown Preview */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-6 bg-green-500 rounded"></div>
                <h4 className="font-semibold text-gray-800">Sheet 3: Per-Person Breakdown</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  Individual breakdown for {trip.people.length} person{trip.people.length !== 1 ? 's' : ''}:
                </p>
                <div className="space-y-1">
                  {trip.people.slice(0, 3).map(person => (
                    <div key={person.id} className="text-sm text-gray-700 flex items-center">
                      <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: person.color }}></span>
                      {person.name}
                    </div>
                  ))}
                  {trip.people.length > 3 && (
                    <div className="text-sm text-gray-500">
                      ...and {trip.people.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Category Breakdown Preview */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-6 bg-yellow-500 rounded"></div>
                <h4 className="font-semibold text-gray-800">Sheet 4: Category Breakdown</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Spending analysis by category with totals and percentages
                </p>
              </div>
            </div>

            {/* Settlement Preview */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-6 bg-red-500 rounded"></div>
                <h4 className="font-semibold text-gray-800">Sheet 5: Settlement</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Simplified settlement plan showing who owes whom and how much
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">What's Included</h4>
              <p className="text-sm text-blue-800">
                The Excel file contains 5 comprehensive sheets with all your trip data:
                summary, detailed expenses, per-person breakdown, category analysis, and settlement plan.
                Perfect for sharing with your travel companions or keeping for records.
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate(`/trip/${id}`)}
            className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
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

export default ExportPage;
