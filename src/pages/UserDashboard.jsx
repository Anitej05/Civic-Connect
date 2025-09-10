import { Link } from "react-router-dom";
import ReportFeed from "../components/ReportFeed";

export default function UserDashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome Citizen</h1>
      <div className="flex space-x-4 mb-6">
        <Link to="/user/report" className="px-4 py-2 bg-sky-600 text-white rounded">
          Submit Report
        </Link>
        <Link to="/user/my-reports" className="px-4 py-2 bg-green-600 text-white rounded">
          My Reports
        </Link>
        <Link to="/user/profile" className="px-4 py-2 bg-gray-700 text-white rounded">
          Profile
        </Link>
      </div>
      <ReportFeed />
    </div>
  );
}
