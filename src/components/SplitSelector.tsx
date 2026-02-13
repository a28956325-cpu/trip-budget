import React from 'react';
import { Person, Split } from '../types';
import PersonAvatar from './PersonAvatar';

interface SplitSelectorProps {
  people: Person[];
  totalAmount: number;
  splitMethod: 'equal' | 'exact' | 'percentage';
  splits: Split[];
  onSplitMethodChange: (method: 'equal' | 'exact' | 'percentage') => void;
  onSplitsChange: (splits: Split[]) => void;
}

const SplitSelector: React.FC<SplitSelectorProps> = ({
  people,
  totalAmount,
  splitMethod,
  splits,
  onSplitMethodChange,
  onSplitsChange
}) => {
  const togglePerson = (personId: string) => {
    const exists = splits.find(s => s.personId === personId);
    
    if (exists) {
      onSplitsChange(splits.filter(s => s.personId !== personId));
    } else {
      const newSplit: Split = {
        personId,
        amount: 0,
        percentage: 0
      };
      onSplitsChange([...splits, newSplit]);
    }
  };

  const updateSplitAmount = (personId: string, value: number) => {
    onSplitsChange(splits.map(s => 
      s.personId === personId ? { ...s, amount: value } : s
    ));
  };

  const updateSplitPercentage = (personId: string, value: number) => {
    onSplitsChange(splits.map(s => 
      s.personId === personId ? { ...s, percentage: value, amount: (totalAmount * value / 100) } : s
    ));
  };

  React.useEffect(() => {
    if (splitMethod === 'equal' && splits.length > 0 && totalAmount > 0) {
      const amountPerPerson = totalAmount / splits.length;
      const expectedAmount = parseFloat(amountPerPerson.toFixed(2));
      
      // Only update if the amounts have changed to prevent infinite loop
      const needsUpdate = splits.some(s => Math.abs(s.amount - expectedAmount) > 0.001);
      if (needsUpdate) {
        onSplitsChange(splits.map(s => ({ ...s, amount: expectedAmount })));
      }
    }
  }, [splitMethod, splits, totalAmount, onSplitsChange]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Split Method
        </label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => onSplitMethodChange('equal')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              splitMethod === 'equal'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Equal
          </button>
          <button
            type="button"
            onClick={() => onSplitMethodChange('exact')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              splitMethod === 'exact'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Exact
          </button>
          <button
            type="button"
            onClick={() => onSplitMethodChange('percentage')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              splitMethod === 'percentage'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Percentage
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Split Among
        </label>
        <div className="space-y-2">
          {people.map(person => {
            const split = splits.find(s => s.personId === person.id);
            const isSelected = !!split;

            return (
              <div key={person.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => togglePerson(person.id)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <PersonAvatar person={person} size="sm" showName />
                
                {isSelected && splitMethod === 'exact' && (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={split?.amount || 0}
                    onChange={(e) => updateSplitAmount(person.id, parseFloat(e.target.value) || 0)}
                    className="ml-auto w-24 px-2 py-1 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                )}
                
                {isSelected && splitMethod === 'percentage' && (
                  <div className="ml-auto flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={split?.percentage || 0}
                      onChange={(e) => updateSplitPercentage(person.id, parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                )}
                
                {isSelected && splitMethod === 'equal' && (
                  <span className="ml-auto text-sm font-medium text-gray-600">
                    {split?.amount.toFixed(2)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {splitMethod !== 'equal' && splits.length > 0 && (
        <div className="p-3 bg-primary-50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">Total:</span>
            <span className="font-bold text-primary-700">
              {splits.reduce((sum, s) => sum + s.amount, 0).toFixed(2)} / {totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SplitSelector;
