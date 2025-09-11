import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import adminReportsReducer from "./features/reportsSlice"; // For admin reports
import userReportsReducer from "./features/userReportsSlice"; // For citizen's own reports
import reportSubmissionReducer from "./features/reportSubmissionSlice"; // For the report form
import nearbyReportsReducer from "./features/nearbyReportsSlice"; // For the nearby feed

const store = configureStore({
  reducer: {
    auth: authReducer,
    adminReports: adminReportsReducer, // Use the new key and reducer
    userReports: userReportsReducer,
    reportSubmission: reportSubmissionReducer,
    nearbyReports: nearbyReportsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export default store;
