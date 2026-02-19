import { Trip, Settlement, Expense } from '../types';
import { convertCurrency } from './currency';

interface Balance {
  personId: string;
  balance: number;
}

const convertExpenseToBaseCurrency = (expense: Expense, baseCurrency: string): number => {
  return convertCurrency(expense.amount, expense.currency, baseCurrency);
};

export const calculateBalances = (trip: Trip): Map<string, number> => {
  const balances = new Map<string, number>();
  
  // Initialize balances for all people
  trip.people.forEach(person => {
    balances.set(person.id, 0);
  });
  
  // Calculate balances
  trip.expenses.forEach(expense => {
    // Convert expense amount to base currency
    const amountInBaseCurrency = convertExpenseToBaseCurrency(expense, trip.currency);
    
    // The payer gets credited
    const paidAmount = balances.get(expense.paidBy) || 0;
    balances.set(expense.paidBy, paidAmount + amountInBaseCurrency);
    
    // Handle item-level splitting
    if (expense.splitMethod === 'items' && expense.items && expense.items.length > 0) {
      // Calculate splits from items
      const itemSplits = new Map<string, number>();
      
      expense.items.forEach(item => {
        const itemAmountInBase = convertCurrency(item.amount, expense.currency, trip.currency);
        const perPerson = itemAmountInBase / item.splitAmong.length;
        
        item.splitAmong.forEach(personId => {
          const current = itemSplits.get(personId) || 0;
          itemSplits.set(personId, current + perPerson);
        });
      });
      
      // Debit each person their share
      itemSplits.forEach((amount, personId) => {
        const owedAmount = balances.get(personId) || 0;
        balances.set(personId, owedAmount - amount);
      });
    } else {
      // Regular split method - convert each split amount to base currency
      expense.splits.forEach(split => {
        const splitAmountInBase = convertCurrency(split.amount, expense.currency, trip.currency);
        const owedAmount = balances.get(split.personId) || 0;
        balances.set(split.personId, owedAmount - splitAmountInBase);
      });
    }
  });
  
  return balances;
};

export const calculateSettlements = (trip: Trip): Settlement[] => {
  const balances = calculateBalances(trip);
  const settlements: Settlement[] = [];
  
  // Convert to array and separate debtors and creditors
  const balanceArray: Balance[] = Array.from(balances.entries()).map(([personId, balance]) => ({
    personId,
    balance
  }));
  
  const debtors = balanceArray.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);
  const creditors = balanceArray.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);
  
  let i = 0;
  let j = 0;
  
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    
    const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
    
    if (amount > 0.01) {
      settlements.push({
        from: debtor.personId,
        to: creditor.personId,
        amount: parseFloat(amount.toFixed(2)),
        settled: false
      });
    }
    
    debtor.balance += amount;
    creditor.balance -= amount;
    
    if (Math.abs(debtor.balance) < 0.01) i++;
    if (Math.abs(creditor.balance) < 0.01) j++;
  }
  
  return settlements;
};

export const getPersonBalance = (trip: Trip, personId: string): { paid: number; owed: number; balance: number } => {
  let paid = 0;
  let owed = 0;
  
  trip.expenses.forEach(expense => {
    const amountInBase = convertExpenseToBaseCurrency(expense, trip.currency);
    
    if (expense.paidBy === personId) {
      paid += amountInBase;
    }
    
    if (expense.splitMethod === 'items' && expense.items && expense.items.length > 0) {
      // Calculate owed amount from items
      expense.items.forEach(item => {
        if (item.splitAmong.includes(personId)) {
          const itemAmountInBase = convertCurrency(item.amount, expense.currency, trip.currency);
          owed += itemAmountInBase / item.splitAmong.length;
        }
      });
    } else {
      const split = expense.splits.find(s => s.personId === personId);
      if (split) {
        const splitAmountInBase = convertCurrency(split.amount, expense.currency, trip.currency);
        owed += splitAmountInBase;
      }
    }
  });
  
  return {
    paid: parseFloat(paid.toFixed(2)),
    owed: parseFloat(owed.toFixed(2)),
    balance: parseFloat((paid - owed).toFixed(2))
  };
};

// Calculate each person's total spending (sum of their splits in all expenses)
export const calculatePersonSpending = (trip: Trip): Map<string, number> => {
  const spending = new Map<string, number>();
  
  // Initialize spending for all people
  trip.people.forEach(person => {
    spending.set(person.id, 0);
  });
  
  // Calculate spending from all expenses
  trip.expenses.forEach(expense => {
    if (expense.splitMethod === 'items' && expense.items && expense.items.length > 0) {
      // Item-level: each person's share = sum of items they're in, divided by people in that item
      expense.items.forEach(item => {
        const itemAmountInBase = convertCurrency(item.amount, expense.currency, trip.currency);
        const perPerson = itemAmountInBase / item.splitAmong.length;
        
        item.splitAmong.forEach(personId => {
          spending.set(personId, (spending.get(personId) || 0) + perPerson);
        });
      });
    } else {
      // Regular split: use the splits array
      expense.splits.forEach(split => {
        const splitAmountInBase = convertCurrency(split.amount, expense.currency, trip.currency);
        spending.set(split.personId, (spending.get(split.personId) || 0) + splitAmountInBase);
      });
    }
  });
  
  // Round to 2 decimal places
  spending.forEach((value, key) => {
    spending.set(key, parseFloat(value.toFixed(2)));
  });
  
  return spending;
};

// Calculate each person's total paid amount
export const calculatePersonPaid = (trip: Trip): Map<string, number> => {
  const paid = new Map<string, number>();
  
  // Initialize paid for all people
  trip.people.forEach(person => {
    paid.set(person.id, 0);
  });
  
  // Calculate paid from all expenses
  trip.expenses.forEach(expense => {
    const amountInBase = convertExpenseToBaseCurrency(expense, trip.currency);
    paid.set(expense.paidBy, (paid.get(expense.paidBy) || 0) + amountInBase);
  });
  
  // Round to 2 decimal places
  paid.forEach((value, key) => {
    paid.set(key, parseFloat(value.toFixed(2)));
  });
  
  return paid;
};

// Net balance = paid - spending (positive means owed money back, negative means owes money)
export const calculateNetBalances = (trip: Trip): Map<string, number> => {
  const spending = calculatePersonSpending(trip);
  const paid = calculatePersonPaid(trip);
  const balances = new Map<string, number>();
  
  trip.people.forEach(person => {
    const personPaid = paid.get(person.id) || 0;
    const personSpent = spending.get(person.id) || 0;
    balances.set(person.id, parseFloat((personPaid - personSpent).toFixed(2)));
  });
  
  return balances;
};
