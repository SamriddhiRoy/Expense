import { useState, useEffect } from 'react';
import { ExpenseForm } from './components/expenses/ExpenseForm';
import { ExpenseList } from './components/expenses/ExpenseList';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('date_desc');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchExpenses = async () => {
    const params = new URLSearchParams();
    if (categoryFilter) {
      params.append('category', categoryFilter);
    }
    if (sortOrder) {
      params.append('sort', sortOrder);
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/expenses?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load expenses');
      }
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/expenses`);
      if (!response.ok) {
        throw new Error('Failed to load categories');
      }
      const data = await response.json();
      const uniqueCategories = [...new Set(data.map((e) => e.category))].sort();
      setCategories(uniqueCategories);
    } catch (err) {
      console.error(err);
      // Keep categories as-is on failure; main error surfaced via expenses fetch
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, sortOrder]);

  const handleExpenseAdded = () => {
    fetchExpenses();
    fetchCategories();
  };

  return (
    <div>
      <h1>Expense Tracker</h1>
      <ExpenseForm onAdded={handleExpenseAdded} />
      <ExpenseList
        expenses={expenses}
        categoryFilter={categoryFilter}
        sortOrder={sortOrder}
        categories={categories}
        loading={loading}
        error={error}
        onCategoryFilterChange={setCategoryFilter}
        onSortOrderChange={setSortOrder}
      />
    </div>
  );
}

export default App;
