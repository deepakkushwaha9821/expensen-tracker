// src/store.jsx
import { configureStore } from "@reduxjs/toolkit";
import expensesReducer from "./features/expensesSlice.jsx";
import authReducer from "./features/authSlice.jsx";

export const store = configureStore({
  reducer: {
    expenses: expensesReducer,
    auth: authReducer
  }
});
export default store; // ✅ now it's default