import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ReportDetails from "./pages/ReportDetails";
import UserDashboard from "./pages/UserDashboard";
import ReportForm from "./pages/ReportForm";
import MyReports from "./pages/MyReports";
import Profile from "./pages/Profile";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";

function RoleBasedRoute({ children, adminOnly = false }) {
  const { user } = useUser();
  const role = user?.publicMetadata?.role || "citizen"; // Clerk role field

  if (adminOnly && role !== "admin") return <Navigate to="/user" replace />;
  if (!adminOnly && role === "admin") return <Navigate to="/admin" replace />;

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin routes */}
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

      {/* User routes */}
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

      {/* Default */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
