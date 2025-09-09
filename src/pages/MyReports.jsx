import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadMyReports } from "../features/userReportsSlice";
import { useUser } from "@clerk/clerk-react";

export default function MyReports() {
  const dispatch = useDispatch();
  const { user } = useUser();
  const { myReports, loading } = useSelector((s) => s.userReports);

  useEffect(() => {
    if (user?.id) {
      dispatch(loadMyReports(user.id));
    }
  }, [dispatch, user]);

  if (loading) return <div className="p-6">Loading your reports...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Reports</h2>
      {myReports.length === 0 ? (
        <p className="text-gray-600">You haven’t submitted any reports yet.</p>
      ) : (
        <ul className="space-y-3">
          {myReports.map((r) => (
            <li key={r.id} className="p-4 border rounded bg-white shadow-sm">
              <h3 className="font-semibold">{r.title}</h3>
              <p className="text-sm text-gray-600">{r.category}</p>
              <p>Status: <span className="font-medium">{r.status}</span></p>
              <p className="text-xs text-gray-500">
                {new Date(r.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
