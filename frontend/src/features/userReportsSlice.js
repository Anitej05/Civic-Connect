import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchFeedReports,
  fetchUserReports,
  submitUserReport,
} from "../services/api";

// Thunks for async actions
export const loadFeed = createAsyncThunk(
  "userReports/loadFeed",
  async (token) => {
    const response = await fetchFeedReports(null, null, token);
    return response.data; // The API returns { status, data }
  }
);

export const loadMyReports = createAsyncThunk(
  "userReports/loadMyReports",
  async (token) => {
    const response = await fetchUserReports(token);
    return response.data; // The API returns { status, data }
  }
);

export const addReport = createAsyncThunk(
  "userReports/addReport",
  async ({ reportData, token }) => {
    const newReport = await submitUserReport(reportData, token);
    // The smart-create endpoint returns the created report directly
    return newReport;
  }
);

const userReportsSlice = createSlice({
  name: "userReports",
  initialState: {
    feed: [],
    myReports: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.feed = action.payload;
      })
      .addCase(loadFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(loadMyReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMyReports.fulfilled, (state, action) => {
        state.loading = false;
        state.myReports = action.payload;
      })
      .addCase(loadMyReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReport.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new report to the beginning of both lists
        state.feed.unshift(action.payload);
        state.myReports.unshift(action.payload);
      })
      .addCase(addReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default userReportsSlice.reducer;