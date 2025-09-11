import { UserProfile } from "@clerk/clerk-react";

export default function Profile() {
  return (
    <div className="page-container bg-gray-50 flex items-center justify-center py-12">
      {/* Fix: Added a wrapper div to apply a scale transform */}
      <div className="profile-container">
        <UserProfile />
      </div>
    </div>
  );
}