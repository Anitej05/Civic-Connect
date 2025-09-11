import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNearbyReports, selectNearbyReports } from "../features/nearbyReportsSlice";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function ReportFeed() {
  const dispatch = useDispatch();
  const { reports, loading, error } = useSelector(selectNearbyReports);
  const [locating, setLocating] = useState(true);

  useEffect(() => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          dispatch(fetchNearbyReports({ lat: latitude, lon: longitude }));
          setLocating(false);
        },
        (geoError) => {
          toast.error("Could not get location. Showing a generic feed is not yet supported.");
          console.error("Geolocation Error:", geoError);
          setLocating(false);
          // Here you could dispatch an action to fetch a generic, non-geolocated feed
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
      setLocating(false);
    }
  }, [dispatch]);

  if (locating || loading) {
    return <div className="p-6 text-center">Loading Nearby Reports...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container-md">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Nearby Reports</h2>
        
        {reports.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 mb-4">No reports found in your area.</p>
            <Link to="/report" className="btn-primary">
              Be the first to report an issue!
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {reports.map((r) => (
              <li key={r.id} className="report-card">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-1">{r.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">{r.category}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                    <Link
                      to={`/reports/${r.id}`}
                      className="text-sm text-sky-600 hover:underline inline-block mt-2"
                    >
                      View details
                    </Link>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      r.status === "Resolved"
                        ? "bg-green-100 text-green-700"
                        : r.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
