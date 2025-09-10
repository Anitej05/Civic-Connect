import { UserProfile } from "@clerk/clerk-react";

export default function Profile() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      <UserProfile path="/user/profile" routing="path" />
    </div>
  );
}
