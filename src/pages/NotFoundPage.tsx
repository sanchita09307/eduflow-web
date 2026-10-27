import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-rose-500/10">
          <AlertOctagon className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-slate-200">Page Not Found</h2>
          <p className="text-sm text-slate-400">
            The curriculum module, group deliverable, or resource you requested does not exist or has been archived.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-sm font-semibold text-slate-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
