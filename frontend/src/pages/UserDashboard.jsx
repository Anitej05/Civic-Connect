import { Link } from "react-router-dom";
import ReportFeed from "../components/ReportFeed";

export default function UserDashboard() {
  return (
    <div className="page-container bg-gray-50">
      <div className="container-lg">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-6">Welcome Citizen</h1>
          <div className="flex justify-center gap-4">
            <Link to="/user/report" className="btn-primary">
              Submit Report
            </Link>
            {/* Fix: Use className for consistent styling */}
            <Link to="/user/my-reports" className="btn-primary">
              My Reports
            </Link>
            {/* Fix: Use className for consistent styling */}
            <Link to="/user/profile" className="btn-secondary">
              Profile
            </Link>
          </div>
        </header>
        <ReportFeed />
      </div>
    </div>
  );
}