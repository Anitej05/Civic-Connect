import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchFeedReports, fetchUserReports, submitUserReport } from "../services/api";

// Async actions
export const loadFeed = createAsyncThunk("userReports/loadFeed", async () => {
  return await fetchFeedReports();
});

export const loadMyReports = createAsyncThunk("userReports/loadMyReports", async (userId) => {
  return await fetchUserReports(userId);
});

export const addReport = createAsyncThunk("userReports/addReport", async (reportData) => {
  return await submitUserReport(reportData);
});

// Slice
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
      // Feed
      .addCase(loadFeed.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.feed = action.payload;
      })
      .addCase(loadFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // MyReports
      .addCase(loadMyReports.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadMyReports.fulfilled, (state, action) => {
        state.loading = false;
        state.myReports = action.payload;
      })
      .addCase(loadMyReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // AddReport
      .addCase(addReport.fulfilled, (state, action) => {
        state.myReports.push(action.payload); // optimistic update
        state.feed.unshift(action.payload);   // also show in feed
      });
  },
});

export default userReportsSlice.reducer;
