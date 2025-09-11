import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyReports, selectUserReports } from "../features/userReportsSlice";

export default function MyReports() {
  const dispatch = useDispatch();
  const { reports, loading, error } = useSelector(selectUserReports);

  useEffect(() => {
    dispatch(fetchMyReports());
  }, [dispatch]);

  if (loading) return <div className="p-6 text-center">Loading your reports...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="page-container">
      <div className="container-md">
        <div className="card">
          <h1 className="text-2xl font-bold mb-6">My Submitted Reports</h1>
          {reports.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 mb-4">
                You haven't submitted any reports yet.
              </p>
              <Link to="/report" className="btn-primary">
                Submit Your First Report
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {reports.map((r) => (
                <li key={r.id} className="report-card">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{r.title}</h3>
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
    </div>
  );
}
