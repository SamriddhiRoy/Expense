import { useState } from 'react';
import { v4 as uuid } from 'uuid';

export function ExpenseForm({ onAdded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData(e.target);
    const idempotencyKey = uuid();

    const API_URL = import.meta.env.VITE_API_URL || '';

    try {
      const response = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey,
          amount: Number(data.get('amount')),
          category: data.get('category'),
          description: data.get('description'),
          date: data.get('date'),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add expense');
      }

      await response.json();
      onAdded();
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px' }}>
          {error}
        </div>
      )}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="amount">Amount *</label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <input id="category" name="category" required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group full-width">
          <label htmlFor="description">Description</label>
          <input id="description" name="description" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="date">Date *</label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="form-group" style={{ justifyContent: 'flex-end' }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </div>
      </div>
    </form>
  );
}

