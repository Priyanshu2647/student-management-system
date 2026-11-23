import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-7xl font-black text-blue-600">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-slate-900">
        Page Not Found
      </h2>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        The academic portal route you requested does not exist or may have been moved.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
      >
        <Home className="w-4 h-4" />
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
