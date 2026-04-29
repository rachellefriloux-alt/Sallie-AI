'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full rounded-2xl border border-violet-500/20 bg-black/30 backdrop-blur-sm p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-rose-500/20">
            <AlertCircle className="w-12 h-12 text-rose-400" />
          </div>
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">Something went wrong</h1>
        <p className="text-gray-400 text-sm mb-6">
          We encountered an unexpected error. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-violet-500/30 hover:border-violet-500/50 text-violet-200 hover:text-white font-medium transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
