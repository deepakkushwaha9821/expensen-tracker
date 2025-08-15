import { createSlice } from "@reduxjs/toolkit";

const loginTime = localStorage.getItem("loginTime");
const expired = !loginTime || Date.now() - loginTime > 86400000; // 1 day

const initialState = expired
  ? { user: null, token: null }
  : {
      user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
      token: localStorage.getItem("token") || null,
    };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("loginTime", Date.now());
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("loginTime");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
