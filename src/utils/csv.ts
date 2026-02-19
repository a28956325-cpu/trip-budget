import { ExpenseCategory } from '../types';

export interface CSVRow {
  date: string;
  description: string;
  amount: number;
  category?: ExpenseCategory;
  currency?: string;
}

export interface ParsedCSV {
  rows: CSVRow[];
  headers: string[];
  detectedFormat: string;
}

// Common CSV column name patterns
const DATE_PATTERNS = ['date', '日期', 'transaction date', '交易日期', 'datetime'];
const DESCRIPTION_PATTERNS = ['description', '描述', 'memo', '摘要', 'merchant', '商家', 'details', '明細'];
const AMOUNT_PATTERNS = ['amount', '金額', 'total', 'price', '價格', 'debit', 'withdrawal', '支出'];

const normalizeHeader = (header: string): string => {
  return header.toLowerCase().trim();
};

const detectColumn = (headers: string[], patterns: string[]): number => {
  const normalizedHeaders = headers.map(normalizeHeader);
  
  for (let i = 0; i < normalizedHeaders.length; i++) {
    for (const pattern of patterns) {
      if (normalizedHeaders[i].includes(pattern)) {
        return i;
      }
    }
  }
  
  return -1;
};

const parseDate = (dateStr: string): string => {
  // Try various date formats
  const formats = [
    /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/, // YYYY-MM-DD or YYYY/MM/DD
    /(\d{1,2})[-/](\d{1,2})[-/](\d{4})/, // MM-DD-YYYY or DD-MM-YYYY
    /(\d{4})(\d{2})(\d{2})/, // YYYYMMDD
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[0] || format === formats[2]) {
        // YYYY-MM-DD format
        const year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        return `${year}-${month}-${day}`;
      } else {
        // Try to determine if it's MM-DD-YYYY or DD-MM-YYYY
        const part1 = parseInt(match[1]);
        const year = match[3];
        
        // If first part > 12, it must be day
        if (part1 > 12) {
          return `${year}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
        } else {
          // Assume MM-DD-YYYY (US format)
          return `${year}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`;
        }
      }
    }
  }
  
  // Default to today if parsing fails
  return new Date().toISOString().split('T')[0];
};

const parseAmount = (amountStr: string): number => {
  // Remove currency symbols and commas
  const cleaned = amountStr.replace(/[^0-9.-]/g, '');
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? 0 : Math.abs(amount); // Always positive
};

const suggestCategory = (description: string): ExpenseCategory => {
  const desc = description.toLowerCase();
  
  // Food keywords
  if (desc.includes('restaurant') || desc.includes('cafe') || desc.includes('food') || 
      desc.includes('餐廳') || desc.includes('咖啡') || desc.includes('食')) {
    return 'food';
  }
  
  // Accommodation keywords
  if (desc.includes('hotel') || desc.includes('airbnb') || desc.includes('hostel') || 
      desc.includes('旅館') || desc.includes('飯店')) {
    return 'accommodation';
  }
  
  // Transport keywords
  if (desc.includes('taxi') || desc.includes('uber') || desc.includes('train') || 
      desc.includes('bus') || desc.includes('flight') || desc.includes('計程車') || 
      desc.includes('捷運') || desc.includes('交通')) {
    return 'transport';
  }
  
  // Entertainment keywords
  if (desc.includes('movie') || desc.includes('game') || desc.includes('entertainment') || 
      desc.includes('電影') || desc.includes('娛樂')) {
    return 'entertainment';
  }
  
  // Clothing keywords
  if (desc.includes('clothing') || desc.includes('fashion') || desc.includes('衣服') || 
      desc.includes('服飾')) {
    return 'clothing';
  }
  
  return 'other';
};

export const parseCSV = (csvContent: string): ParsedCSV => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }
  
  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  // Detect column indices
  const dateCol = detectColumn(headers, DATE_PATTERNS);
  const descCol = detectColumn(headers, DESCRIPTION_PATTERNS);
  const amountCol = detectColumn(headers, AMOUNT_PATTERNS);
  
  if (dateCol === -1 || descCol === -1 || amountCol === -1) {
    throw new Error('Could not detect required columns (date, description, amount). Please check your CSV format.');
  }
  
  // Parse rows
  const rows: CSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    
    if (columns.length < Math.max(dateCol, descCol, amountCol) + 1) {
      continue; // Skip incomplete rows
    }
    
    const date = parseDate(columns[dateCol]);
    const description = columns[descCol] || 'Unknown';
    const amount = parseAmount(columns[amountCol]);
    
    if (amount > 0) {
      rows.push({
        date,
        description,
        amount,
        category: suggestCategory(description),
      });
    }
  }
  
  return {
    rows,
    headers,
    detectedFormat: 'Generic CSV',
  };
};

export const readCSVFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};
