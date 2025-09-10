
import React from "react";
import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div className="login-wrap bg-gradient-to-b from-sky-50 to-gray-100 w-full flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center" style={{marginBottom: '2.5rem'}}>
        <div className="flex flex-col items-center justify-center gap-2">
          <div style={{width:48,height:48,borderRadius:12,background:'var(--color-primary)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#fff"/><text x="16" y="21" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#0ea5e9">CC</text></svg>
          </div>
          <span className="text-2xl font-bold text-gray-900">Civic Connect</span>
        </div>
        <div className="text-base text-gray-500 font-medium mt-2">AI-powered Civic Issue Resolution</div>
      </div>
      <div className="w-full flex justify-center">
        <div style={{width: '100%', maxWidth: 560, borderRadius: '1.25rem', boxShadow: '0 18px 50px rgba(2,6,23,0.12)', background: '#fff', padding: '2.5rem 2rem'}}>
          <h1 className="text-3xl font-bold text-center" style={{marginBottom: '2rem', marginTop: 0, padding: 0}}>Admin Sign In</h1>
          <SignIn 
            routing="path" 
            path="/login"
            appearance={{
              elements: {
                card: 'shadow-none p-0 m-0 bg-transparent',
                headerTitle: 'text-xl font-bold text-gray-900 m-0 p-0',
                headerSubtitle: 'text-base text-gray-500 mb-4 m-0 p-0',
                socialButtonsBlockButton: 'border-2 hover:border-gray-300 h-12 text-base rounded-lg m-0',
                formField: 'mb-4 m-0',
                formFieldInput: 'h-12 text-base rounded-lg m-0',
                footer: 'hidden',
              },
            }} 
          />
        </div>
      </div>
    </div>
  );
}
