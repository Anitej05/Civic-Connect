import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectAuth } from '../features/authSlice';

const AdminRoute = () => {
  const { isAuthenticated, user, loading } = useSelector(selectAuth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Not logged in, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    // Logged in, but not an admin. Redirect to a "not authorized" page or the user dashboard.
    // Redirecting to the user dashboard is a good default.
    return <Navigate to="/user" replace />;
  }

  // If authenticated and an admin, render the child route component.
  return <Outlet />;
};

export default AdminRoute;
