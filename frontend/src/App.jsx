import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";

// Import all pages
import AuthPage from "./pages/AuthPage";
import SignUpPage from "./pages/SignUpPage";
import Dashboard from "./pages/Dashboard";
import ReportDetails from "./pages/ReportDetails";
import UserDashboard from "./pages/UserDashboard";
import ReportForm from "./pages/ReportForm";
import MyReports from "./pages/MyReports";
import Profile from "./pages/Profile";
import Landing from "./pages/Landing";
import Header from "./components/Header";

// This is your original RoleBasedRoute component. It remains unchanged.
function RoleBasedRoute({ children, adminOnly = false }) {
  const { user, isLoaded } = useUser();

  // Wait until the user object is loaded before checking the role
  if (!isLoaded) {
    return <div className="p-6 text-center">Loading...</div>; // Or a spinner component
  }

  const role = user?.publicMetadata?.role || "citizen";

  if (adminOnly && role !== "admin") return <Navigate to="/user" replace />;
  if (!adminOnly && role === "admin") return <Navigate to="/admin" replace />;

  return children;
}

// This is your original HomeRedirect component. It remains unchanged.
function HomeRedirect() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  const role = user?.publicMetadata?.role || "citizen";

  return <Navigate to={role === "admin" ? "/admin" : "/user"} replace />;
}

// This is your AppLayout component, with logic updated for the new pages.
function AppLayout() {
  const location = useLocation();
  const { isSignedIn } = useUser();

  // The header should be hidden on the landing page, login page, AND the new sign-up page.
  const isPublicPage =
    (location.pathname === "/" && !isSignedIn) ||
    location.pathname === "/login" ||
    location.pathname === "/sign-up"; // Added the new sign-up route here

  return (
    // Fix: Replaced the main div with the new app container for the fixed layout
    <div className="app-container">
      {!isPublicPage && (
        // Fix: Wrapped Header component in a header tag with the correct class
        <header className="site-header">
          <Header />
        </header>
      )}
      {/* Fix: The main content area now has its class for scrolling and height adjustment */}
      <main className={`main-content ${isPublicPage ? "no-header" : ""}`}>
        <Routes>
          {/* === Public Routes === */}
          {/* The /login route now points to AuthPage, which has the default Clerk UI */}
          <Route path="/login" element={<AuthPage />} />
          {/* A new /sign-up route is added for the registration flow */}
          <Route path="/sign-up" element={<SignUpPage />} />

          {/* Root route: directs to landing page or role-based dashboard */}
          <Route
            path="/"
            element={
              <>
                <SignedIn>
                  <HomeRedirect />
                </SignedIn>
                <SignedOut>
                  <Landing />
                </SignedOut>
              </>
            }
          />

          {/* === Admin Routes (Unchanged from your original code) === */}
          <Route
            path="/admin"
            element={
              <SignedIn>
                <RoleBasedRoute adminOnly>
                  <Dashboard />
                </RoleBasedRoute>
              </SignedIn>
            }
          />
          <Route
            path="/admin/reports/:id"
            element={
              <SignedIn>
                <RoleBasedRoute adminOnly>
                  <ReportDetails />
                </RoleBasedRoute>
              </SignedIn>
            }
          />

          {/* === User Routes (Unchanged from your original code) === */}
          <Route
            path="/user"
            element={
              <SignedIn>
                <RoleBasedRoute>
                  <UserDashboard />
                </RoleBasedRoute>
              </SignedIn>
            }
          />
          <Route
            path="/user/report"
            element={
              <SignedIn>
                <RoleBasedRoute>
                  <ReportForm />
                </RoleBasedRoute>
              </SignedIn>
            }
          />
          <Route
            path="/user/my-reports"
            element={
              <SignedIn>
                <RoleBasedRoute>
                  <MyReports />
                </RoleBasedRoute>
              </SignedIn>
            }
          />
          <Route
            path="/user/profile"
            element={
              <SignedIn>
                <RoleBasedRoute>
                  <Profile />
                </RoleBasedRoute>
              </SignedIn>
            }
          />

          {/* === Default Fallback Route (Unchanged from your original code) === */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// Your original default export remains unchanged.
export default AppLayout;