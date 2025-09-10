import React from "react";
import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div className="login-container">
      <div className="login-header">
        <div className="logo-container">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="logo-svg"
          >
            <circle cx="24" cy="24" r="24" fill="#0ea5e9" />
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
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Civic Connect</h1>
        <p className="text-base text-gray-500 font-medium mt-1">
          AI-powered Civic Issue Resolution
        </p>
      </div>

      {/* No more custom card wrapper. Styling is now fully inside SignIn */}
      <SignIn
        routing="path"
        path="/login"
        appearance={{
          elements: {
            // Style Clerk's card to be our card
            card: "bg-white p-10 rounded-2xl shadow-xl w-full max-w-md",
            headerTitle: "text-2xl font-bold text-center mb-6",
            headerSubtitle: "hidden", // Hide default subtitle if not needed
            footer: "hidden",
            formFieldInput:
              "h-12 text-base rounded-lg focus:ring-sky-500 focus:border-sky-500",
            formButtonPrimary: "h-12 text-base rounded-lg",
            socialButtonsBlockButton:
              "h-12 text-base rounded-lg border-gray-300 hover:bg-gray-50",
          },
        }}
      >
      </SignIn>
    </div>
  );
}