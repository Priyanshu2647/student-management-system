import React from 'react';

const Loader = ({ message = 'Loading data...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>
      </div>
    );
  }

  return (
    <div className="py-12 flex flex-col items-center justify-center">
      <div className="w-9 h-9 rounded-full border-3 border-blue-200 border-t-blue-600 animate-spin"></div>
      <p className="mt-3 text-xs font-medium text-slate-500">{message}</p>
    </div>
  );
};

export default Loader;
