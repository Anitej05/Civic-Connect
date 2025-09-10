import { configureStore } from "@reduxjs/toolkit";
import reportsReducer from "./features/reportsSlice";      // admin
import userReportsReducer from "./features/userReportsSlice"; // citizen

const store = configureStore({
  reducer: {
    reports: reportsReducer,
    userReports: userReportsReducer,
  },
});

export default store;
