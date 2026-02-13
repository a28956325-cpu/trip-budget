import ExcelJS from 'exceljs';
import { Trip } from '../types';
import { getCategoryName } from './categories';
import { formatDate, formatCurrency } from './helpers';
import { calculateBalances, calculateSettlements } from './settlement';

export const exportToExcel = async (trip: Trip): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  
  workbook.creator = 'TravelSplit';
  workbook.created = new Date();

  // Sheet 1: Summary
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Field', key: 'field', width: 20 },
    { header: 'Value', key: 'value', width: 40 }
  ];
  
  summarySheet.addRows([
    { field: 'Trip Name', value: trip.name },
    { field: 'Description', value: trip.description },
    { field: 'Currency', value: trip.currency },
    { field: 'Start Date', value: formatDate(trip.startDate) },
    { field: 'End Date', value: formatDate(trip.endDate) },
    { field: 'Total Expenses', value: formatCurrency(trip.expenses.reduce((sum, e) => sum + e.amount, 0), trip.currency) },
    { field: 'Number of Expenses', value: trip.expenses.length },
    { field: 'Number of People', value: trip.people.length },
  ]);
  
  // Style header row
  summarySheet.getRow(1).font = { bold: true };
  summarySheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0EA5E9' }
  };

  // Sheet 2: All Expenses
  const expensesSheet = workbook.addWorksheet('All Expenses');
  expensesSheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Paid By', key: 'paidBy', width: 15 },
    { header: 'Split Method', key: 'splitMethod', width: 15 },
    { header: 'Split Details', key: 'splitDetails', width: 40 },
    { header: 'Notes', key: 'notes', width: 30 }
  ];
  
  trip.expenses.forEach(expense => {
    const payer = trip.people.find(p => p.id === expense.paidBy);
    const splitDetails = expense.splits.map(split => {
      const person = trip.people.find(p => p.id === split.personId);
      return `${person?.name}: ${formatCurrency(split.amount, trip.currency)}`;
    }).join(', ');
    
    expensesSheet.addRow({
      date: formatDate(expense.date),
      description: expense.description,
      category: getCategoryName(expense.category),
      amount: expense.amount,
      paidBy: payer?.name || 'Unknown',
      splitMethod: expense.splitMethod,
      splitDetails: splitDetails,
      notes: expense.notes || ''
    });
  });
  
  expensesSheet.getRow(1).font = { bold: true };
  expensesSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0EA5E9' }
  };

  // Sheet 3: Per-Person Breakdown
  const personSheet = workbook.addWorksheet('Per-Person Breakdown');
  personSheet.columns = [
    { header: 'Person', key: 'person', width: 20 },
    { header: 'Total Paid', key: 'paid', width: 15 },
    { header: 'Total Owed', key: 'owed', width: 15 },
    { header: 'Net Balance', key: 'balance', width: 15 }
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
    
    personSheet.addRow({
      person: person.name,
      paid: paid,
      owed: owed,
      balance: balance
    });
  });
  
  personSheet.getRow(1).font = { bold: true };
  personSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0EA5E9' }
  };

  // Sheet 4: Category Breakdown
  const categoryTotals = new Map<string, number>();
  trip.expenses.forEach(expense => {
    const current = categoryTotals.get(expense.category) || 0;
    categoryTotals.set(expense.category, current + expense.amount);
  });
  
  const categorySheet = workbook.addWorksheet('Category Breakdown');
  categorySheet.columns = [
    { header: 'Category', key: 'category', width: 30 },
    { header: 'Total Amount', key: 'amount', width: 15 },
    { header: 'Percentage', key: 'percentage', width: 15 }
  ];
  
  const totalAmount = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
  
  Array.from(categoryTotals.entries()).forEach(([category, amount]) => {
    const percentage = totalAmount > 0 ? (amount / totalAmount * 100).toFixed(1) + '%' : '0%';
    categorySheet.addRow({
      category: getCategoryName(category as any),
      amount: amount,
      percentage: percentage
    });
  });
  
  categorySheet.getRow(1).font = { bold: true };
  categorySheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0EA5E9' }
  };

  // Sheet 5: Settlement
  const settlements = calculateSettlements(trip);
  const settlementSheet = workbook.addWorksheet('Settlement');
  settlementSheet.columns = [
    { header: 'From', key: 'from', width: 20 },
    { header: 'To', key: 'to', width: 20 },
    { header: 'Amount', key: 'amount', width: 15 }
  ];
  
  settlements.forEach(settlement => {
    const fromPerson = trip.people.find(p => p.id === settlement.from);
    const toPerson = trip.people.find(p => p.id === settlement.to);
    settlementSheet.addRow({
      from: fromPerson?.name || 'Unknown',
      to: toPerson?.name || 'Unknown',
      amount: settlement.amount
    });
  });
  
  settlementSheet.getRow(1).font = { bold: true };
  settlementSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0EA5E9' }
  };

  // Write the file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${trip.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};
