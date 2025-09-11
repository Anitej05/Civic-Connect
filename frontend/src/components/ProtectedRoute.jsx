import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectAuth } from '../features/authSlice';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useSelector(selectAuth);
  const location = useLocation();

  // Show a loading indicator while checking for authentication token,
  // e.g., on a page refresh.
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them back after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child route component.
  return <Outlet />;
};

export default ProtectedRoute;
