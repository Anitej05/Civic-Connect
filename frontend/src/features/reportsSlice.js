import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAdminReports, fetchReportById, updateReportStatus } from "../services/api";

// Load all reports
export const loadReports = createAsyncThunk(
  "reports/loadReports",
  async (department) => {
    const data = await fetchAdminReports({ department });
    return data;
  }
);

// Load single report
export const loadReportById = createAsyncThunk(
  "reports/loadReportById",
  async (id) => {
    const data = await fetchReportById(id);
    return data;
  }
);

// Update status
export const changeReportStatus = createAsyncThunk(
  "reports/changeReportStatus",
  async ({ id, status }) => {
    const res = await updateReportStatus(id, status);
    return { id, status: res.report.status };
  }
);

const reportsSlice = createSlice({
  name: "reports",
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
    departmentFilter: null,
  },
  reducers: {
    setDepartmentFilter(state, action) {
      state.departmentFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadReports.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(loadReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(loadReportById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(changeReportStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        if (state.current && state.current._id === id) {
          state.current.status = status;
        }
        const idx = state.list.findIndex((r) => r._id === id);
        if (idx !== -1) {
          state.list[idx].status = status;
        }
      });
  },
});

export const { setDepartmentFilter } = reportsSlice.actions;
export default reportsSlice.reducer;
