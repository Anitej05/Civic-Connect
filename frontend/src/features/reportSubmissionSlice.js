import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportService } from '../services/api';

export const submitReport = createAsyncThunk(
  'reportSubmission/submit',
  async (formData, { rejectWithValue }) => {
    try {
      // The reportService.smartCreate function will handle the API call
      const response = await reportService.smartCreate(formData);
      return response; // This should be the newly created report object from the backend
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Report submission failed';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  success: false,
};

const reportSubmissionSlice = createSlice({
  name: 'reportSubmission',
  initialState,
  reducers: {
    // A reset action to clear the state, e.g., after the user navigates away
    resetSubmissionState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitReport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitReport.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(submitReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetSubmissionState } = reportSubmissionSlice.actions;
export const selectReportSubmission = (state) => state.reportSubmission;
export default reportSubmissionSlice.reducer;
