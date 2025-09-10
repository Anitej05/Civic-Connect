import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadFeed } from "../features/userReportsSlice";
import { Link } from "react-router-dom";

export default function ReportFeed() {
  const dispatch = useDispatch();
  const { feed, loading, error } = useSelector((s) => s.userReports);

  useEffect(() => {
    dispatch(loadFeed());
  }, [dispatch]);

  if (loading) return <div>Loading feed...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="container-md">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Latest Reports</h2>
        <ul className="space-y-4">
          {feed.map((r) => (
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
      </div>
    </div>
  );
}
