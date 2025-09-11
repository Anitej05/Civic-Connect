import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentReportById,
  updateReportStatus,
  selectAdminReports,
  fetchAdminReports, // We might need to fetch all reports if the user lands here directly
} from "../features/reportsSlice";
import toast from "react-hot-toast";

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentReport, reports, loading } = useSelector(selectAdminReports);
  const [status, setStatus] = useState("");

  useEffect(() => {
    // If the reports list is empty (e.g., user refreshed on this page),
    // fetch all reports first, then set the current one.
    if (reports.length === 0) {
      dispatch(fetchAdminReports()).then(() => {
        dispatch(setCurrentReportById(id));
      });
    } else {
      dispatch(setCurrentReportById(id));
    }
  }, [dispatch, id, reports.length]);

  useEffect(() => {
    if (currentReport) {
      setStatus(currentReport.status);
    }
  }, [currentReport]);

  const handleUpdate = async () => {
    await dispatch(updateReportStatus({ reportId: id, status }));
    toast.success("Status updated successfully!");
  };

  if (loading && !currentReport) return <div className="p-6 text-center">Loading Report...</div>;
  if (!currentReport) return <div className="p-6 text-center">Report not found. It may have been deleted or the ID is incorrect.</div>;

  const [lon, lat] = currentReport.location.coordinates;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 btn-secondary"
        >
          &larr; Back to Dashboard
        </button>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold">{currentReport.title}</h2>
          <p className="mt-2 text-gray-700">{currentReport.original_text || "No description provided."}</p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>Category:</strong> {currentReport.category}</div>
            <div><strong>Urgency:</strong> {currentReport.urgency}</div>
            <div><strong>Department:</strong> {currentReport.assigned_department}</div>
            <div><strong>Created:</strong> {new Date(currentReport.created_at).toLocaleString()}</div>
          </div>

          <div className="mt-6">
            <label htmlFor="status-select" className="block text-sm font-medium text-gray-700">Update Status</label>
            <div className="mt-1 flex items-center gap-4">
              <select
                id="status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="select"
              >
                <option>Submitted</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
              <button
                onClick={handleUpdate}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>

          {currentReport.image_url && (
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Submitted Image</h3>
                <img src={`http://localhost:8000${currentReport.image_url}`} alt="Report" className="rounded-lg max-w-full h-auto" />
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-semibold">Location</h3>
            <div className="text-sm">{`Latitude: ${lat}, Longitude: ${lon}`}</div>
            {/* In a real app, you would embed a small map here */}
          </div>
        </div>
      </div>
    </div>
  );
}
