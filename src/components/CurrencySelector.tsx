import React from 'react';
import { SUPPORTED_CURRENCIES } from '../utils/currency';
import { useI18n } from '../contexts/I18nContext';

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  className?: string;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ value, onChange, className = '' }) => {
  const { language } = useI18n();
  const isZh = language === 'zh-TW';

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white ${className}`}
    >
      {SUPPORTED_CURRENCIES.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {currency.symbol} {currency.code} - {isZh ? currency.name : currency.nameEn}
        </option>
      ))}
    </select>
  );
};

export default CurrencySelector;
