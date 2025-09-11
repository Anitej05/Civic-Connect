import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportService } from '../services/api';

export const fetchNearbyReports = createAsyncThunk(
  'nearbyReports/fetchNearby',
  async ({ lat, lon }, { rejectWithValue }) => {
    try {
      const reports = await reportService.getNearby(lat, lon);
      return reports;
    } catch (error) {
      const message =
        error.response?.data?.detail || error.message || 'Failed to fetch nearby reports';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  reports: [],
  loading: false,
  error: null,
};

const nearbyReportsSlice = createSlice({
  name: 'nearbyReports',
  initialState,
  reducers: {
    clearNearbyReports: (state) => {
      state.reports = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNearbyReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNearbyReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchNearbyReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearNearbyReports } = nearbyReportsSlice.actions;
export const selectNearbyReports = (state) => state.nearbyReports;
export default nearbyReportsSlice.reducer;
