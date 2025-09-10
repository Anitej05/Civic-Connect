
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loadReportById,
  changeReportStatus,
} from "../features/reportsSlice";
import toast from "react-hot-toast";

export default function ReportDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const dispatch = useDispatch();
  const { current, loading } = useSelector((state) => state.reports);
  const [status, setStatus] = useState("");

  useEffect(() => {
    dispatch(loadReportById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (current) setStatus(current.status);
  }, [current]);

  async function handleUpdate() {
    await dispatch(changeReportStatus({ id, status }));
    toast.success("Status updated");
  }

  if (loading) return <div className="p-6">Loading report...</div>;
  if (!current) return <div className="p-6">Report not found</div>;

  const [lon, lat] = current.location.coordinates;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <button
          onClick={() => nav(-1)}
          className="mb-4 px-3 py-1 border rounded"
        >
          Back
        </button>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold">{current.title}</h2>
          <p className="mt-2 text-sm text-gray-700">{current.original_text}</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <strong>Category:</strong> {current.category}
            </div>
            <div>
              <strong>Urgency:</strong> {current.urgency}
            </div>
            <div>
              <strong>Department:</strong> {current.assigned_department}
            </div>
            <div>
              <strong>Created:</strong>{" "}
              {new Date(current.created_at).toLocaleString()}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 px-3 py-2 border rounded"
            >
              <option>Submitted</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleUpdate}
                className="px-3 py-2 bg-sky-600 text-white rounded"
              >
                Update Status
              </button>
            </div>
          </div>

          <div className="mt-6">
            <strong>Location:</strong>
            <div>{`Latitude: ${lat}, Longitude: ${lon}`}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
