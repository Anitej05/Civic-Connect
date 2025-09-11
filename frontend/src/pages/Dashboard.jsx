import React, { useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import DepartmentFilter from "../components/DepartmentFilter";
import ReportMarker from "../components/ReportMarker";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAdminReports,
  setDepartmentFilter,
  selectAdminReports,
} from "../features/reportsSlice";

export default function Dashboard() {
  const dispatch = useDispatch();
  const {
    reports,
    loading,
    error,
    departmentFilter,
  } = useSelector(selectAdminReports);

  useEffect(() => {
    // Fetch reports whenever the component mounts or the filter changes
    dispatch(fetchAdminReports(departmentFilter));
  }, [dispatch, departmentFilter]);

  const handleFilterChange = (value) => {
    dispatch(setDepartmentFilter(value));
  };

  return (
    // The parent container is now the main layout from App.jsx,
    // so we just need to render the map itself.
    <main className="flex-1 relative">
      {/* Overlay for filters and loading/error states */}
      <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg flex items-center gap-4">
        <DepartmentFilter
          value={departmentFilter}
          onChange={handleFilterChange}
        />
        <button
          onClick={() => dispatch(fetchAdminReports(departmentFilter))}
          className="btn-secondary"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
        {error && <div className="text-red-600 text-sm">Error: {error}</div>}
      </div>

      <MapContainer
        id="map"
        center={[17.4458, 78.4013]} // Default center, can be dynamic
        zoom={12}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {reports.map((report) => (
          <ReportMarker key={report.id} report={report} />
        ))}
      </MapContainer>
    </main>
  );
}
