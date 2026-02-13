import { Trip, Settlement } from '../types';

interface Balance {
  personId: string;
  balance: number;
}

export const calculateBalances = (trip: Trip): Map<string, number> => {
  const balances = new Map<string, number>();
  
  // Initialize balances for all people
  trip.people.forEach(person => {
    balances.set(person.id, 0);
  });
  
  // Calculate balances
  trip.expenses.forEach(expense => {
    // The payer gets credited
    const paidAmount = balances.get(expense.paidBy) || 0;
    balances.set(expense.paidBy, paidAmount + expense.amount);
    
    // Each split participant gets debited
    expense.splits.forEach(split => {
      const owedAmount = balances.get(split.personId) || 0;
      balances.set(split.personId, owedAmount - split.amount);
    });
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
        amount: parseFloat(amount.toFixed(2))
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
    if (expense.paidBy === personId) {
      paid += expense.amount;
    }
    
    const split = expense.splits.find(s => s.personId === personId);
    if (split) {
      owed += split.amount;
    }
  });
  
  return {
    paid: parseFloat(paid.toFixed(2)),
    owed: parseFloat(owed.toFixed(2)),
    balance: parseFloat((paid - owed).toFixed(2))
  };
};
