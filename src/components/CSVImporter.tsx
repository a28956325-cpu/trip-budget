import React, { useState } from 'react';
import { ExpenseCategory, Person } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { parseCSV, readCSVFile, CSVRow } from '../utils/csv';
import { categories } from '../utils/categories';
import Toast from './Toast';

interface CSVImporterProps {
  people: Person[];
  tripCurrency: string;
  onImport: (rows: CSVRow[], paidBy: string, splitAmongAll: boolean) => void;
  onClose: () => void;
}

const CSVImporter: React.FC<CSVImporterProps> = ({
  people,
  tripCurrency,
  onImport,
  onClose
}) => {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [paidBy, setPaidBy] = useState(people[0]?.id || '');
  const [splitAmongAll, setSplitAmongAll] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setToast({ message: 'Please select a CSV file', type: 'error' });
      return;
    }

    setFile(selectedFile);
    setLoading(true);

    try {
      const content = await readCSVFile(selectedFile);
      const parsed = parseCSV(content);
      setRows(parsed.rows);
      // Select all rows by default
      setSelectedRows(new Set(parsed.rows.map((_, i) => i)));
      setToast({ message: `${parsed.rows.length} transactions loaded`, type: 'success' });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'Failed to parse CSV', type: 'error' });
      setRows([]);
      setSelectedRows(new Set());
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const toggleAll = () => {
    if (selectedRows.size === rows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(rows.map((_, i) => i)));
    }
  };

  const updateCategory = (index: number, category: ExpenseCategory) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], category };
    setRows(newRows);
  };

  const handleImport = () => {
    const rowsToImport = rows.filter((_, i) => selectedRows.has(i));
    if (rowsToImport.length === 0) {
      setToast({ message: 'Please select at least one transaction', type: 'error' });
      return;
    }

    onImport(rowsToImport, paidBy, splitAmongAll);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Import CSV</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* File Upload */}
          {!file && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <label className="cursor-pointer">
                <span className="text-primary-600 hover:text-primary-700 font-medium">
                  Choose a CSV file
                </span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Upload bank or credit card statement in CSV format
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">{t('common.loading')}</p>
            </div>
          )}

          {/* Preview */}
          {file && rows.length > 0 && (
            <>
              {/* Settings */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('expense.paidBy')}
                    </label>
                    <select
                      value={paidBy}
                      onChange={(e) => setPaidBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {people.map(person => (
                        <option key={person.id} value={person.id}>{person.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={splitAmongAll}
                        onChange={(e) => setSplitAmongAll(e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Split all expenses equally among all people
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedRows.size === rows.length}
                            onChange={toggleAll}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {rows.map((row, index) => (
                        <tr
                          key={index}
                          className={`${selectedRows.has(index) ? 'bg-primary-50' : 'bg-white'} hover:bg-gray-50`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedRows.has(index)}
                              onChange={() => toggleRow(index)}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{row.date}</td>
                          <td className="px-4 py-3 text-sm text-gray-800">{row.description}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">
                            {tripCurrency} ${row.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={row.category || 'other'}
                              onChange={(e) => updateCategory(index, e.target.value as ExpenseCategory)}
                              className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.emoji} {cat.name}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-primary-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <span className="text-gray-700">{selectedRows.size} transactions selected</span>
                  <span className="text-gray-500 ml-2">
                    (Total: {tripCurrency} $
                    {rows
                      .filter((_, i) => selectedRows.has(i))
                      .reduce((sum, row) => sum + row.amount, 0)
                      .toFixed(2)}
                    )
                  </span>
                </div>
                <button
                  onClick={handleImport}
                  disabled={selectedRows.size === 0}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  Import Selected
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} isVisible={true} onClose={() => setToast(null)} />}
    </div>
  );
};

export default CSVImporter;
