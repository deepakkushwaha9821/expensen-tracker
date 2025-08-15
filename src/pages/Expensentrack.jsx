import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";


// Import the dedicated CSS file
import './Expensentrack.css';

// Register Chart.js components
Chart.register(...registerables);

// Helper function to get the Font Awesome class for a category
const getCategoryIcon = (category) => {
  const icons = {
    food: 'fas fa-utensils',
    transport: 'fas fa-car',
    shopping: 'fas fa-shopping-bag',
    entertainment: 'fas fa-film',
    bills: 'fas fa-file-invoice-dollar',
    health: 'fas fa-heartbeat',
    education: 'fas fa-graduation-cap',
    travel: 'fas fa-plane',
    income: 'fas fa-coins',
    groceries: 'fas fa-shopping-cart',
    other: 'fas fa-ellipsis-h',
  };
  return icons[category] || 'fas fa-ellipsis-h';
};

// Helper function to format category names for display
const formatCategory = (category) => {
  const formatted = {
    food: 'Food & Dining',
    transport: 'Transportation',
    shopping: 'Shopping',
    entertainment: 'Entertainment',
    bills: 'Bills & Utilities',
    health: 'Healthcare',
    education: 'Education',
    travel: 'Travel',
    income: 'Income',
    groceries: 'Groceries',
    other: 'Other',
  };
  return formatted[category] || category;
};

// Main App component
const Expensentracker = () => {
  // App data and UI state
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const [type, setType] = useState('expense');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  // Chart refs
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // 1. Load transactions from local storage on initial render
  useEffect(() => {
    const storedTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
    setTransactions(storedTransactions);
  }, []);

  // 2. Update local storage, summary stats, and chart whenever transactions change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateSummary();
    updateChart();
  }, [transactions]);
  
  // 3. Chart initialization and update
  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'],
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
          },
        },
      });
      updateChart();
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  const updateChart = () => {
    if (chartInstance.current) {
      const expensesByCategory = transactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
          return acc;
        }, {});

      const labels = Object.keys(expensesByCategory).map(cat => formatCategory(cat));
      const data = Object.values(expensesByCategory);

      chartInstance.current.data.labels = labels;
      chartInstance.current.data.datasets[0].data = data;
      chartInstance.current.update();
    }
  };

  // 4. Functions for adding and deleting transactions
  const addTransaction = (e) => {
    e.preventDefault();
    if (!description || !amount || !category || !type) {
      showNotification('Please fill in all fields.', 'error');
      return;
    }

    const newTransaction = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      category,
      type,
      date: new Date().toISOString(),
    };

    setTransactions([newTransaction, ...transactions]);
    setDescription('');
    setAmount('');
    setCategory('other');
    setType('expense');
    showNotification('Transaction added successfully!', 'success');
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
    showNotification('Transaction deleted!', 'success');
  };
    

  const navigate = useNavigate();
  // Function to handle logout and clear local data
  const handleLogout = () => {
    localStorage.clear();
    
    setTransactions([]);
    showNotification('Logged out successfully and local data cleared!', 'success');
    navigate("/login");  
  };


  // 5. Modal and other UI functions
  const handleClearAll = () => {
    setIsModalOpen(true);
  };

  const confirmClearAll = () => {
    setTransactions([]);
    setIsModalOpen(false);
    showNotification('All transactions cleared!', 'success');
  };

  const cancelClearAll = () => {
    setIsModalOpen(false);
  };

  const updateSummary = () => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const balance = income - expenses;

    setTotalIncome(income.toFixed(2));
    setTotalExpenses(expenses.toFixed(2));
    setTotalBalance(balance.toFixed(2));
  };

  const showNotification = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };
  
  const filteredTransactions = transactions
    .filter(t => {
      const searchMatch =
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const typeMatch = typeFilter === 'all' || t.type === typeFilter;
      const categoryMatch = categoryFilter === 'all' || t.category === categoryFilter;
      return searchMatch && typeMatch && categoryMatch;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="main-container">
      {/* Notification Message */}
      {message && (
        <div className={`notification ${messageType === 'success' ? 'notification-success' : 'notification-error'}`}>
          {message}
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Confirm Clear All</h3>
            <p className="modal-text">Are you sure you want to delete all transactions? This action cannot be undone.</p>
            <div className="modal-buttons">
              <button onClick={confirmClearAll} className="button button-danger">
                Yes, Clear All
              </button>
              <button onClick={cancelClearAll} className="button button-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="header gradient-bg">
        <div className="header-container">
          <div className="header-brand">
            <i className="fas fa-wallet header-icon"></i>
            <h1 className="header-title">Expense Tracker</h1>
          </div>
          <div className="header-actions">
            <div className="header-balance">
              <p className="header-balance-label">Total Balance</p>
              <p className={`header-balance-amount ${totalBalance < 0 ? 'text-red' : 'text-white'}`}>${totalBalance}</p>
            </div>
            <button onClick={handleLogout} className="button button-logout">
              <i className="fas fa-sign-out-alt icon-left"></i>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="content-container">
        {/* Dashboard Section */}
        <section className="dashboard-section card">
          <h2 className="section-title">
            <i className="fas fa-chart-line section-icon"></i>
            Dashboard
          </h2>
          <div className="dashboard-welcome-message">
            <h3 className="welcome-title">Welcome, Guest!</h3>
            <p className="welcome-id">Data is stored locally on this device.</p>
          </div>
          <div className="dashboard-cards">
            <div className="dashboard-card expense-card">
              <p className="dashboard-label">Total Income</p>
              <p className="dashboard-value text-green">${totalIncome}</p>
            </div>
            <div className="dashboard-card expense-card">
              <p className="dashboard-label">Total Expenses</p>
              <p className="dashboard-value text-red">${totalExpenses}</p>
            </div>
            <div className="dashboard-card expense-card">
              <p className="dashboard-label">Total Transactions</p>
              <p className="dashboard-value text-blue">{transactions.length}</p>
            </div>
          </div>
        </section>

        {/* Add Transaction Form */}
        <section className="add-transaction-section card">
          <h2 className="section-title">
            <i className="fas fa-plus-circle section-icon"></i>
            Add Transaction
          </h2>
          <form onSubmit={addTransaction} className="transaction-form">
            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <input
                type="text"
                id="description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input"
                placeholder="Enter description"
              />
            </div>
            <div className="form-group">
              <label htmlFor="amount" className="form-label">Amount</label>
              <input
                type="number"
                id="amount"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-input"
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label htmlFor="category" className="form-label">Category</label>
              <select
                id="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                <option value="other">Select category</option>
                <option value="food">Food & Dining</option>
                <option value="groceries">Groceries</option>
                <option value="transport">Transportation</option>
                <option value="shopping">Shopping</option>
                <option value="entertainment">Entertainment</option>
                <option value="bills">Bills & Utilities</option>
                <option value="health">Healthcare</option>
                <option value="education">Education</option>
                <option value="travel">Travel</option>
                <option value="income">Income</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="type" className="form-label">Type</label>
              <select
                id="type"
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="form-select"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="form-group form-group-button">
              <button
                type="submit"
                className="button button-primary"
              >
                <i className="fas fa-plus icon-left"></i>
                Add Transaction
              </button>
            </div>
          </form>
        </section>

        <div className="grid-container">
          <section className="chart-section card">
            <h3 className="section-title">
              <i className="fas fa-chart-pie section-icon"></i>
              Expense Categories
            </h3>
            <div className="chart-canvas-container">
              <canvas ref={chartRef}></canvas>
            </div>
          </section>
          
          <section className="filters-section card">
            <h3 className="section-title">
              <i className="fas fa-filter section-icon"></i>
              Filters & Search
            </h3>
            <div className="filters-container">
              <div className="form-group">
                <label htmlFor="searchInput" className="form-label">Search</label>
                <input
                  type="text"
                  id="searchInput"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  placeholder="Search transactions..."
                />
              </div>
              <div className="filter-selects">
                <div className="form-group">
                  <label htmlFor="typeFilter" className="form-label">Filter by Type</label>
                  <select
                    id="typeFilter"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="form-select"
                  >
                    <option value="all">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="categoryFilter" className="form-label">Filter by Category</label>
                  <select
                    id="categoryFilter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="form-select"
                  >
                    <option value="all">All Categories</option>
                    <option value="food">Food & Dining</option>
                    <option value="groceries">Groceries</option>
                    <option value="transport">Transportation</option>
                    <option value="shopping">Shopping</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="bills">Bills & Utilities</option>
                    <option value="health">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="travel">Travel</option>
                    <option value="income">Income</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        </div>
        
        <section className="transactions-section card">
          <div className="transactions-header">
            <h3 className="section-title">
              <i className="fas fa-list section-icon"></i>
              Recent Transactions
            </h3>
            <button
              onClick={handleClearAll}
              className="button button-clear"
            >
              <i className="fas fa-trash icon-left"></i>
              Clear All
            </button>
          </div>
          
          <div className="transactions-list">
            {transactions.length > 0 ? (
              filteredTransactions.map((transaction) => {
                const isIncome = transaction.type === 'income';
                const amountClass = isIncome ? 'text-green' : 'text-red';
                const icon = getCategoryIcon(transaction.category);
                const date = new Date(transaction.date).toLocaleDateString();
  
                return (
                  <div key={transaction.id} className="transaction-item slide-in">
                    <div className="transaction-info">
                      <div className="transaction-icon-wrapper">
                        <i className={`${icon} transaction-icon`}></i>
                      </div>
                      <div>
                        <h4 className="transaction-description">{transaction.description}</h4>
                        <p className="transaction-meta">{formatCategory(transaction.category)} • {date}</p>
                      </div>
                    </div>
                    <div className="transaction-actions">
                      <span className={`transaction-amount ${amountClass}`}>
                        {isIncome ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                      </span>
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="button-delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <img src="https://placehold.co/200x200" alt="Empty wallet illustration" className="empty-state-image" />
                <p className="empty-state-text">No transactions yet</p>
                <p className="empty-state-subtext">Add your first transaction to get started!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
  
export default Expensentracker;
