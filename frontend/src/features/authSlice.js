import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService, apiClient } from '../services/api';

// --- Async Thunks ---

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('token', data.access_token);
      dispatch(fetchUser()); // Fetch user data after successful login
      return data;
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Login Failed';
      return rejectWithValue(message);
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      const data = await authService.signup(email, password);
      localStorage.setItem('token', data.access_token);
      dispatch(fetchUser()); // Fetch user data after successful signup
      return data;
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Signup Failed';
      return rejectWithValue(message);
    }
  }
);

export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/users/me');
      return data;
    } catch (error) {
      return rejectWithValue('Session expired or token is invalid.');
    }
  }
);

// --- Slice Definition ---

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  loading: true, // Start true to check auth status on app load
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload.access_token;
        // Don't set loading to false yet, wait for fetchUser
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.token = action.payload.access_token;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export default authSlice.reducer;
