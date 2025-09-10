
import React from "react";
import { CircleMarker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";

const statusColor = {
  Submitted: "#ef4444",
  "In Progress": "#f59e0b",
  Resolved: "#10b981",
};

export default function ReportMarker({ report }) {
  const navigate = useNavigate();
  const [lon, lat] = report.location.coordinates;
  const color = statusColor[report.status] || "#6366f1";

  return (
    <CircleMarker
      center={[lat, lon]}
      pathOptions={{ color, fillColor: color, fillOpacity: 0.7 }}
      radius={10}
      eventHandlers={{
        click: () => navigate(`/reports/${report._id}`),
      }}
    >
      <Popup>
        <div className="max-w-xs">
          <h3 className="font-semibold">{report.title}</h3>
          <p className="text-sm">{report.original_text}</p>
          <p className="mt-1 text-xs text-gray-600">
            {report.category} • {report.urgency}
          </p>
          <p className="mt-1 text-sm">
            <strong>Status: </strong>
            {report.status}
          </p>
          <button
            onClick={() => navigate(`/reports/${report._id}`)}
            className="mt-2 px-2 py-1 bg-sky-600 text-white rounded text-sm"
          >
            View
          </button>
        </div>
      </Popup>
    </CircleMarker>
  );
}
