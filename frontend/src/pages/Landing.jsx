import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen w-full relative overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-50 via-sky-100 to-blue-100"></div>
      
      {/* Subtle Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 z-10" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23bae6fd' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>
      
      {/* Content Layer */}
      <div className="relative z-20 flex flex-col flex-grow">
        {/* Header */}
        <header className="w-full bg-white/80 backdrop-blur-sm sticky top-0">
          <div className="container mx-auto flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
              <svg
                width="32"
                height="32"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ borderRadius: '8px' }}
              >
                <circle cx="24" cy="24" r="24" fill="#0ea5e9" />
                <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="20" fontWeight="bold" fill="white">
                  CC
                </text>
              </svg>
              <span className="text-xl font-semibold text-gray-900">Civic Connect</span>
            </div>
            <Link to="/login">
              <button className="px-4 py-2 bg-sky-600 text-white rounded-lg shadow-sm hover:bg-sky-700 transition-colors duration-200">
                Sign In / Sign Up
              </button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-grow flex items-center">
          <div className="container mx-auto px-4 text-center">
            <h1 
              className="text-4xl md:text-6xl font-extrabold text-gray-800 leading-tight tracking-tight"
              style={{ textShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)' }}
            >
              Report Civic Issues. <br />
              <span className="text-sky-600">See Real Change.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Civic Connect is your direct line to city officials. Submit reports, track their progress, and help improve your community with the power of AI-driven insights.
            </p>
            <div className="mt-10">
              <Link to="/login">
                <button className="inline-flex items-center justify-center px-8 py-4 bg-sky-600 text-white font-semibold rounded-lg shadow-lg hover:bg-sky-700 transition-all duration-200 transform hover:scale-105 text-lg">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full py-6">
          <div className="container mx-auto text-center text-gray-500 text-sm">
            &copy; 2025 Civic Connect, Hyderabad. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}