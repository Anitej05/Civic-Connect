import React, { useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import DepartmentFilter from "../components/DepartmentFilter";
import ReportMarker from "../components/ReportMarker";
import { useSelector, useDispatch } from "react-redux";
import { loadReports, setDepartmentFilter } from "../features/reportsSlice";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useUserRole } from "../hooks/useUserRole"; // Import the hook for role checking

export default function Dashboard() {
  const dispatch = useDispatch();
  const { list: reports, loading, error, departmentFilter } = useSelector(
    (state) => state.reports
  );
  const { user } = useUser();
  const { signOut } = useClerk();
  const nav = useNavigate();
  const { isAdmin, isLoading: isRoleLoading } = useUserRole(); // Use the hook

  useEffect(() => {
    dispatch(loadReports(departmentFilter));
  }, [dispatch, departmentFilter]);

  function handleLogout() {
    signOut();
    toast("Logged out");
    nav("/login");
  }

  // Display a loading message while we verify the user's role
  if (isRoleLoading) {
    return <div className="p-6 text-center">Verifying credentials...</div>;
  }

  // --- Regular User View ---
  // A simple list of reports without the map.
  const userView = (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Submitted Reports</h2>
      {loading && <div>Loading reports...</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report._id} className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-bold">{report.title}</h3>
            <p className="text-gray-600">{report.description}</p>
            <div className="mt-2 text-sm">
              <span className="font-semibold">Status:</span> {report.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // --- Admin View ---
  // The original dashboard with the map.
  const adminView = (
    <main className="flex-1">
      {loading && <div className="p-6">Loading reports...</div>}
      {error && <div className="p-6 text-red-600">Error: {error}</div>}
      <MapContainer
        id="map"
        center={[17.4458, 78.4013]}
        zoom={14}
        scrollWheelZoom
        style={{ height: "calc(100vh - 72px)" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {reports.map((r) => (
          // Pass the 'isAdmin' prop to each marker
          <ReportMarker key={r._id} report={r} isAdmin={isAdmin} />
        ))}
      </MapContainer>
    </main>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-4 bg-white shadow">
        <div className="flex items-center gap-4">
          {/* Dynamically change the title based on the user's role */}
          <h1 className="text-xl font-semibold">
            Civic Connect — {isAdmin ? "Admin" : "Dashboard"}
          </h1>
          {/* Only show the department filter and refresh button to admins */}
          {isAdmin && (
            <>
              <DepartmentFilter
                value={departmentFilter}
                onChange={(val) => dispatch(setDepartmentFilter(val))}
              />
              <button
                onClick={() => dispatch(loadReports(departmentFilter))}
                className="px-3 py-1 rounded border text-sm"
              >
                Refresh
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Signed in as {user?.primaryEmailAddress?.emailAddress}
          </div>
          <button onClick={handleLogout} className="px-3 py-1 rounded border">
            Logout
          </button>
        </div>
      </header>

      {/* Render the correct view based on the user's role */}
      {isAdmin ? adminView : userView}
    </div>
  );
}