import * as XLSX from 'xlsx';
import { Trip } from '../types';
import { getCategoryName } from './categories';
import { formatDate, formatCurrency } from './helpers';
import { calculateBalances, calculateSettlements } from './settlement';

export const exportToExcel = (trip: Trip): void => {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    ['Trip Name', trip.name],
    ['Description', trip.description],
    ['Currency', trip.currency],
    ['Start Date', formatDate(trip.startDate)],
    ['End Date', formatDate(trip.endDate)],
    ['Total Expenses', formatCurrency(trip.expenses.reduce((sum, e) => sum + e.amount, 0), trip.currency)],
    ['Number of Expenses', trip.expenses.length],
    ['Number of People', trip.people.length],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Sheet 2: All Expenses
  const expensesData = [
    ['Date', 'Description', 'Category', 'Amount', 'Paid By', 'Split Method', 'Split Details', 'Notes']
  ];
  
  trip.expenses.forEach(expense => {
    const payer = trip.people.find(p => p.id === expense.paidBy);
    const splitDetails = expense.splits.map(split => {
      const person = trip.people.find(p => p.id === split.personId);
      return `${person?.name}: ${formatCurrency(split.amount, trip.currency)}`;
    }).join(', ');
    
    expensesData.push([
      formatDate(expense.date),
      expense.description,
      getCategoryName(expense.category),
      expense.amount,
      payer?.name || 'Unknown',
      expense.splitMethod,
      splitDetails,
      expense.notes || ''
    ]);
  });
  
  const expensesSheet = XLSX.utils.aoa_to_sheet(expensesData);
  XLSX.utils.book_append_sheet(workbook, expensesSheet, 'All Expenses');

  // Sheet 3: Per-Person Breakdown
  const personData = [
    ['Person', 'Total Paid', 'Total Owed', 'Net Balance']
  ];
  
  const balances = calculateBalances(trip);
  trip.people.forEach(person => {
    const paid = trip.expenses
      .filter(e => e.paidBy === person.id)
      .reduce((sum, e) => sum + e.amount, 0);
    
    const owed = trip.expenses
      .flatMap(e => e.splits)
      .filter(s => s.personId === person.id)
      .reduce((sum, s) => sum + s.amount, 0);
    
    const balance = balances.get(person.id) || 0;
    
    personData.push([
      person.name,
      paid,
      owed,
      balance
    ]);
  });
  
  const personSheet = XLSX.utils.aoa_to_sheet(personData);
  XLSX.utils.book_append_sheet(workbook, personSheet, 'Per-Person Breakdown');

  // Sheet 4: Category Breakdown
  const categoryTotals = new Map<string, number>();
  trip.expenses.forEach(expense => {
    const current = categoryTotals.get(expense.category) || 0;
    categoryTotals.set(expense.category, current + expense.amount);
  });
  
  const categoryData = [
    ['Category', 'Total Amount', 'Percentage']
  ];
  
  const totalAmount = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
  
  Array.from(categoryTotals.entries()).forEach(([category, amount]) => {
    const percentage = totalAmount > 0 ? (amount / totalAmount * 100).toFixed(1) + '%' : '0%';
    categoryData.push([
      getCategoryName(category as any),
      amount,
      percentage
    ]);
  });
  
  const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
  XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Breakdown');

  // Sheet 5: Settlement
  const settlements = calculateSettlements(trip);
  const settlementData = [
    ['From', 'To', 'Amount']
  ];
  
  settlements.forEach(settlement => {
    const fromPerson = trip.people.find(p => p.id === settlement.from);
    const toPerson = trip.people.find(p => p.id === settlement.to);
    settlementData.push([
      fromPerson?.name || 'Unknown',
      toPerson?.name || 'Unknown',
      settlement.amount
    ]);
  });
  
  const settlementSheet = XLSX.utils.aoa_to_sheet(settlementData);
  XLSX.utils.book_append_sheet(workbook, settlementSheet, 'Settlement');

  // Write the file
  XLSX.writeFile(workbook, `${trip.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
