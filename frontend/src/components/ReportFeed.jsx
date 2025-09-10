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
    <div className="bg-white p-6 rounded shadow mt-6 w-full max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">Latest Reports</h2>
      <ul className="space-y-4">
        {feed.map((r) => (
          <li key={r.id} className="border-b pb-3 last:border-none">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{r.title}</h3>
                <p className="text-sm text-gray-600">{r.category}</p>
                <p className="text-xs text-gray-500">
                  {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs ${
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
            <Link
              to={`/reports/${r.id}`}
              className="text-sm text-sky-600 hover:underline"
            >
              View details
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
