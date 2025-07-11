import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Trash2, Calendar, Tag } from 'lucide-react';
import { Trip } from '../page';

interface ExpenseTrackerProps {
  trip: Trip;
  onUpdate: (updates: Partial<Trip>) => void;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ trip, onUpdate }) => {
  const [expenses, setExpenses] = useState<Expense[]>(trip.expenses || []);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'Food & Dining',
    date: ''
  });

  const categories = [
    'Transportation',
    'Accommodation',
    'Food & Dining',
    'Activities',
    'Shopping',
    'Entertainment',
    'Health & Safety',
    'Other'
  ];

  useEffect(() => {
    // Set date only on client side to prevent hydration mismatch
    setNewExpense(prev => ({
      ...prev,
      date: new Date().toISOString().split('T')[0]
    }));
  }, []);

  useEffect(() => {
    onUpdate({ expenses });
  }, [expenses]);

  const addExpense = () => {
    if (newExpense.description && newExpense.amount) {
      const expense: Expense = {
        id: Date.now().toString(),
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        date: newExpense.date
      };
      setExpenses(prev => [...prev, expense]);
      setNewExpense({
        description: '',
        amount: '',
        category: 'Food & Dining',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Custom Expenses</h2>
      </div>

      {/* Add Expense Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Add New Expense</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              type="text"
              value={newExpense.description}
              onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Dinner at restaurant"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              value={newExpense.amount}
              onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={newExpense.date}
              onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={addExpense}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-5 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {/* Expense List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Custom Expenses</h3>
        {expenses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No custom expenses recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => (
              <div key={expense.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium text-gray-900">{expense.description}</h4>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {expense.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-gray-900">${expense.amount.toLocaleString()}</span>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};