export type ExpenseCategory = 'food' | 'clothing' | 'accommodation' | 'transport' | 'education' | 'entertainment' | 'other';

export interface Person {
  id: string;
  name: string;
  color: string;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
  };
}

export interface Split {
  personId: string;
  amount: number;
  percentage?: number;
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  splitAmong: string[]; // person IDs
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  category: ExpenseCategory;
  paidBy: string;
  splitMethod: 'equal' | 'exact' | 'percentage' | 'items';
  splits: Split[];
  items?: ExpenseItem[]; // for item-level splitting
  receiptUrl?: string;
  receiptType?: 'image' | 'pdf';
  ocrText?: string;
  notes?: string;
  createdAt: string;
}

export interface TripBudget {
  total?: number;
  categories?: {
    [key in ExpenseCategory]?: number;
  };
}

export interface Trip {
  id: string;
  name: string;
  description: string;
  currency: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  people: Person[];
  expenses: Expense[];
  budget?: TripBudget;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
  settled?: boolean;
  remindedAt?: string;
}

export interface CategoryInfo {
  id: ExpenseCategory;
  name: string;
  emoji: string;
  color: string;
}

export interface ParsedReceipt {
  amount: number | null;
  category: ExpenseCategory | null;
  description: string | null;
  date: string | null;
  rawText: string;
  extractionMethod?: 'pdf-text' | 'ocr';
  confidence: {
    amount: 'high' | 'medium' | 'low' | 'none';
    category: 'high' | 'medium' | 'low' | 'none';
    description: 'high' | 'medium' | 'low' | 'none';
    date: 'high' | 'medium' | 'low' | 'none';
  };
}
