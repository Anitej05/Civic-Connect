import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportService } from '../services/api';

// Thunk for fetching the logged-in user's reports
export const fetchMyReports = createAsyncThunk(
  'userReports/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const reports = await reportService.getMyReports();
      return reports;
    } catch (error) {
      const message =
        error.response?.data?.detail || error.message || 'Failed to fetch your reports';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  reports: [],
  loading: false,
  error: null,
};

const userReportsSlice = createSlice({
  name: 'userReports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchMyReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const selectUserReports = (state) => state.userReports;
export default userReportsSlice.reducer;
