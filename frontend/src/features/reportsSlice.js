import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminService } from "../services/api";

// Thunk to fetch reports for the admin dashboard
export const fetchAdminReports = createAsyncThunk(
  "reports/fetchAdmin",
  async (department, { rejectWithValue }) => {
    try {
      const reports = await adminService.getReports(department);
      return reports;
    } catch (error) {
      const message =
        error.response?.data?.detail || error.message || 'Failed to fetch admin reports';
      return rejectWithValue(message);
    }
  }
);

// Thunk to update a report's status
export const updateReportStatus = createAsyncThunk(
  "reports/updateStatus",
  async ({ reportId, status }, { rejectWithValue }) => {
    try {
      const updatedReport = await adminService.updateStatus(reportId, status);
      return updatedReport;
    } catch (error) {
      const message =
        error.response?.data?.detail || error.message || 'Failed to update status';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  reports: [],
  currentReport: null, // To hold the report being viewed in detail
  loading: false,
  error: null,
  departmentFilter: null,
};

const adminReportsSlice = createSlice({
  name: "adminReports",
  initialState,
  reducers: {
    setDepartmentFilter(state, action) {
      state.departmentFilter = action.payload;
    },
    setCurrentReportById(state, action) {
      const reportId = action.payload;
      state.currentReport = state.reports.find(r => r.id == reportId) || null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchAdminReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateReportStatus.fulfilled, (state, action) => {
        const updatedReport = action.payload;
        // Update the report in the main list
        const index = state.reports.findIndex((r) => r.id === updatedReport.id);
        if (index !== -1) {
          state.reports[index] = updatedReport;
        }
        // Also update the current report if it's the one being viewed
        if (state.currentReport?.id === updatedReport.id) {
            state.currentReport = updatedReport;
        }
      });
  },
});

export const { setDepartmentFilter, setCurrentReportById } = adminReportsSlice.actions;
export const selectAdminReports = (state) => state.adminReports;
export default adminReportsSlice.reducer;
