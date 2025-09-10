import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, useUser, useClerk } from "@clerk/clerk-react";
import toast from "react-hot-toast";

export default function Header() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  // Determine the correct dashboard URL based on the user's role
  const role = user?.publicMetadata?.role || "citizen";
  const dashboardUrl = role === 'admin' ? '/admin' : '/user';

  const handleSignOut = () => {
    signOut(() => {
      toast.success("Signed out successfully!");
      navigate("/"); // Redirect to landing page on sign out
    });
  };

  return (
    <header className="w-full bg-white shadow-sm" style={{ height: 'var(--header-height)' }}>
      <div className="content-wrap site-header-inner">
        <div className="flex items-center gap-4">
          {/* This link now correctly points to the user's specific dashboard */}
          <Link to={dashboardUrl} className="flex items-center gap-3">
            <svg
              width="32"
              height="32"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ borderRadius: '8px' }}
            >
              <circle cx="24" cy="24" r="24" fill="var(--color-primary)" />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dy=".3em"
                fontSize="20"
                fontWeight="bold"
                fill="white"
              >
                CC
              </text>
            </svg>
            <span className="text-lg font-semibold text-gray-900">Civic Connect</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <SignedIn>
            <div className="text-sm text-gray-700">{user?.primaryEmailAddress?.emailAddress || "User"}</div>
            <button
              onClick={handleSignOut}
              className="ml-2 px-3 py-1 rounded border text-sm"
            >
              Sign out
            </button>
          </SignedIn>

          <SignedOut>
            {/* This button now correctly navigates to your custom login page */}
            <Link to="/login">
              <button className="px-3 py-1 bg-sky-600 text-white rounded shadow-sm">Sign in</button>
            </Link>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}