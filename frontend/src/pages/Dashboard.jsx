import React, { useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import DepartmentFilter from "../components/DepartmentFilter";
import ReportMarker from "../components/ReportMarker";
import { useSelector, useDispatch } from "react-redux";
import { loadReports, setDepartmentFilter } from "../features/reportsSlice";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { list, loading, error, departmentFilter } = useSelector(
    (state) => state.reports
  );
  const { user } = useUser();
  const { signOut } = useClerk();
  const nav = useNavigate();

  useEffect(() => {
    dispatch(loadReports(departmentFilter));
  }, [dispatch, departmentFilter]);

  function handleLogout() {
    signOut();
    toast("Logged out");
    nav("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-4 bg-white shadow">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Civic Connect — Admin</h1>
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
          {list.map((r) => (
            <ReportMarker key={r._id} report={r} />
          ))}
        </MapContainer>
      </main>
    </div>
  );
}
