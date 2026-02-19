export interface Currency {
  code: string;
  symbol: string;
  name: string;
  nameEn: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'TWD', symbol: 'NT$', name: '新台幣', nameEn: 'Taiwan Dollar' },
  { code: 'USD', symbol: '$', name: '美元', nameEn: 'US Dollar' },
  { code: 'JPY', symbol: '¥', name: '日圓', nameEn: 'Japanese Yen' },
  { code: 'EUR', symbol: '€', name: '歐元', nameEn: 'Euro' },
  { code: 'GBP', symbol: '£', name: '英鎊', nameEn: 'British Pound' },
  { code: 'KRW', symbol: '₩', name: '韓圓', nameEn: 'Korean Won' },
  { code: 'THB', symbol: '฿', name: '泰銖', nameEn: 'Thai Baht' },
  { code: 'CNY', symbol: '¥', name: '人民幣', nameEn: 'Chinese Yuan' },
  { code: 'HKD', symbol: 'HK$', name: '港幣', nameEn: 'Hong Kong Dollar' },
  { code: 'SGD', symbol: 'S$', name: '新加坡幣', nameEn: 'Singapore Dollar' },
  { code: 'AUD', symbol: 'A$', name: '澳幣', nameEn: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: '加幣', nameEn: 'Canadian Dollar' },
];

// Static exchange rates (base: USD)
// In a production app, these would be fetched from an API
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  TWD: 31.5,
  JPY: 148.5,
  EUR: 0.92,
  GBP: 0.79,
  KRW: 1320.0,
  THB: 35.5,
  CNY: 7.24,
  HKD: 7.83,
  SGD: 1.34,
  AUD: 1.53,
  CAD: 1.36,
};

export const getCurrency = (code: string): Currency | undefined => {
  return SUPPORTED_CURRENCIES.find(c => c.code === code);
};

export const formatAmount = (amount: number, currencyCode: string, language: 'zh-TW' | 'en' = 'en'): string => {
  const currency = getCurrency(currencyCode);
  if (!currency) {
    return amount.toFixed(2);
  }
  
  return `${currency.symbol} ${amount.toLocaleString(language === 'zh-TW' ? 'zh-TW' : 'en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;
  
  // Convert to USD first, then to target currency
  const amountInUSD = amount / fromRate;
  return amountInUSD * toRate;
};

export const getExchangeRate = (fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) {
    return 1;
  }
  
  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;
  
  return toRate / fromRate;
};
