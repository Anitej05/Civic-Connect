import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function AuthPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="mb-8 text-center">
        <Link to="/" className="inline-block">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ borderRadius: '12px' }}
          >
            <circle cx="24" cy="24" r="24" fill="#0ea5e9" />
            <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="20" fontWeight="bold" fill="white">
              CC
            </text>
          </svg>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Welcome to Civic Connect</h1>
        <p className="text-gray-600">Sign in or create an account to continue</p>
      </div>
      <SignIn path="/login" routing="path" signUpUrl="/sign-up" />
    </div>
  );
}