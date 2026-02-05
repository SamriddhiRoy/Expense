export function ExpenseList({
  expenses,
  categoryFilter,
  sortOrder,
  categories,
  loading,
  error,
  onCategoryFilterChange,
  onSortOrderChange,
}) {
  // Calculate total from visible expenses (client-side)
  const totalPaise = expenses.reduce(
    (sum, expense) => sum + expense.amount_paise,
    0
  );
  const totalAmount = (totalPaise / 100).toFixed(2);

  const formatAmount = (paise) => {
    return (paise / 100).toFixed(2);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="expenses-section">
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="category-filter">Category</label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="sort-order">Sort By</label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value)}
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="total">Total: ₹{totalAmount}</div>

      {error && (
        <div className="message error-message">{error}</div>
      )}

      {loading && !error && (
        <div className="message loading-message">Loading expenses...</div>
      )}

      {!loading && expenses.length === 0 ? (
        <div className="empty-state">No expenses found</div>
      ) : (
        !loading && (
          <table className="expense-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Date</th>
                <th className="amount-header">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="expense-row">
                  <td className="expense-category">{expense.category}</td>
                  <td className="expense-description">
                    {expense.description || '-'}
                  </td>
                  <td className="expense-date">
                    {formatDate(expense.date)}
                  </td>
                  <td className="expense-amount">
                    ₹{formatAmount(expense.amount_paise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
}

