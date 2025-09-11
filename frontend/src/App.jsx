import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser, selectAuth } from './features/authSlice';

// Layout and Component Imports
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Page Imports
import Login from './pages/Login';
import SignUpPage from './pages/SignUpPage';
import Landing from './pages/Landing';
import UserDashboard from './pages/UserDashboard';
import ReportForm from './pages/ReportForm';
import MyReports from './pages/MyReports';
import Dashboard from './pages/Dashboard'; // Admin Dashboard
import ReportDetails from './pages/ReportDetails'; // Can be used by both

// A layout component to wrap pages that need the site header
const MainLayout = ({ children }) => (
  <div className="app-container">
    <header className="site-header">
      <Header />
    </header>
    <main className="main-content">
      {children}
    </main>
  </div>
);

function App() {
  const dispatch = useDispatch();
  const { token, isAuthenticated, user, loading } = useSelector(selectAuth);

  useEffect(() => {
    // On app load, if a token exists in localStorage but the user isn't authenticated in state,
    // try to fetch the user's data to restore the session.
    if (token && !isAuthenticated) {
      dispatch(fetchUser());
    }
  }, [token, isAuthenticated, dispatch]);

  // While checking for the token on initial load, show a loading screen.
  if (loading && !isAuthenticated) {
      return <div className="flex justify-center items-center h-screen"><div>Loading Application...</div></div>;
  }

  return (
    <Routes>
      {/* Public routes that do not require authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/landing" element={<Landing />} />

      {/* Routes protected for any authenticated user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/user" element={<MainLayout><UserDashboard /></MainLayout>} />
        <Route path="/report" element={<MainLayout><ReportForm /></MainLayout>} />
        <Route path="/my-reports" element={<MainLayout><MyReports /></MainLayout>} />
        {/* This report detail page is accessible to citizens for their own reports */}
        <Route path="/reports/:id" element={<MainLayout><ReportDetails /></MainLayout>} />
      </Route>

      {/* Routes protected for admin users only */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<MainLayout><Dashboard /></MainLayout>} />
        {/* Admins use the same detail page component but have different permissions */}
        <Route path="/admin/reports/:id" element={<MainLayout><ReportDetails /></MainLayout>} />
      </Route>

      {/* Redirect logic for the root path */}
      <Route
        path="/"
        element={
          isAuthenticated
            ? (user?.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/user" />)
            : <Navigate to="/landing" />
        }
      />

      {/* A fallback route to redirect any unknown paths to the appropriate home page */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
