import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TripDashboard from './pages/TripDashboard';
import AddExpense from './pages/AddExpense';
import ExpensesList from './pages/ExpensesList';
import PeoplePage from './pages/PeoplePage';
import SettlementPage from './pages/SettlementPage';
import ExportPage from './pages/ExportPage';
import BudgetPage from './pages/BudgetPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trip/:id" element={<TripDashboard />} />
        <Route path="/trip/:id/expense/new" element={<AddExpense />} />
        <Route path="/trip/:id/expense/:expenseId/edit" element={<AddExpense />} />
        <Route path="/trip/:id/expenses" element={<ExpensesList />} />
        <Route path="/trip/:id/people" element={<PeoplePage />} />
        <Route path="/trip/:id/settlement" element={<SettlementPage />} />
        <Route path="/trip/:id/export" element={<ExportPage />} />
        <Route path="/trip/:id/budget" element={<BudgetPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
