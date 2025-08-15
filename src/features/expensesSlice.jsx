import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchExpenses = createAsyncThunk(
  "expenses/fetch",
  async (token) => {
    const { data } = await axios.get("http://localhost:5000/api/expenses", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  }
);

const expensesSlice = createSlice({
  name: "expenses",
  initialState: [],
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchExpenses.fulfilled, (_, action) => action.payload);
  }
});

export default expensesSlice.reducer;
