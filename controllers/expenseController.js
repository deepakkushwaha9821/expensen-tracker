import Expense from "../models/Expense.js";

export const getExpenses = async (req, res) => {
  // This controller function is not directly used by the route,
  // the route handles filtering by userId.
  // For consistency, if this were to be used directly, it should also filter by userId.
  const expenses = await Expense.find({ userId: req.user }); // Added userId filter for consistency
  res.json(expenses);
};

export const addExpense = async (req, res) => {
  const { title, amount } = req.body; // Changed from description to title
  const expense = new Expense({ title, amount, userId: req.user }); // Added userId
  await expense.save();
  res.json(expense);
};
