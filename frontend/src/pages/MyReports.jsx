import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { loadMyReports } from "../features/userReportsSlice";
import { useAuth } from "@clerk/clerk-react";

export default function MyReports() {
  const dispatch = useDispatch();
  // Fix: Get the isLoaded flag from Clerk to prevent a race condition
  const { getToken, isLoaded } = useAuth();
  const { myReports, loading, error } = useSelector((s) => s.userReports);

  useEffect(() => {
    // Fix: Only attempt to load data if the Clerk client is fully loaded
    if (isLoaded) {
      const load = async () => {
        const token = await getToken();
        if (token) {
          dispatch(loadMyReports(token));
        }
      };
      load();
    }
  }, [dispatch, getToken, isLoaded]); // Add isLoaded to the dependency array

  // Show a loading state while Clerk is initializing
  if (!isLoaded || loading) return <div className="p-6 text-center">Loading your reports...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="page-container">
      <div className="container-md">
        <div className="card">
          <h1 className="text-2xl font-bold mb-6">My Submitted Reports</h1>
          {!myReports || myReports.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 mb-4">
                You haven't submitted any reports yet.
              </p>
              <Link to="/user/report" className="btn-primary">
                Submit Your First Report
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {myReports.map((r) => (
                <li key={r.id || r._id} className="report-card">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{r.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(r.created_at).toLocaleString()}
                      </p>
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