import React from "react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, useUser, useClerk } from "@clerk/clerk-react";

export default function Header() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <header className="w-full bg-white shadow-sm" style={{ height: 'var(--header-height)' }}>
      <div className="content-wrap site-header-inner">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div style={{width:32,height:32,borderRadius:8,background:'var(--color-primary)'}} />
            <span className="text-lg font-semibold text-gray-900">Civic Connect</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <SignedIn>
            <div className="text-sm text-gray-700">{user?.primaryEmailAddress?.emailAddress || user?.email || "User"}</div>
            <button
              onClick={() => signOut()}
              className="ml-2 px-3 py-1 rounded border text-sm"
            >
              Sign out
            </button>
          </SignedIn>

          <SignedOut>
            <SignInButton>
                <button className="px-3 py-1 bg-sky-600 text-white rounded shadow-sm">Sign in</button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
