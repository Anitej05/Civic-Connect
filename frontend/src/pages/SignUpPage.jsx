import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
// We will create these later
import { signupUser, selectAuth } from '../features/authSlice';
import toast from 'react-hot-toast';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(selectAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    const resultAction = await dispatch(signupUser({ email, password }));
    if (signupUser.fulfilled.match(resultAction)) {
      toast.success('Account created successfully! Welcome!');
      navigate('/'); // Redirect to dashboard or home
    } else {
      toast.error(resultAction.payload || 'Failed to sign up');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center mb-8">
        <div className="inline-block bg-sky-500 rounded-full p-3">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="24" fill="#FFFFFF" />
                <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="20" fontWeight="bold" fill="#0ea5e9">
                CC
                </text>
            </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Create your Account</h1>
        <p className="text-md text-gray-500 font-medium mt-1">
          Join Civic Connect to make your voice heard.
        </p>
      </div>
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 text-base border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition-shadow"
              placeholder="you@example.com"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-12 px-4 text-base border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition-shadow"
              placeholder="••••••••"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full h-12 px-4 text-base border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition-shadow"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base font-semibold text-white bg-sky-500 rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:bg-sky-300"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-sky-600 hover:text-sky-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
