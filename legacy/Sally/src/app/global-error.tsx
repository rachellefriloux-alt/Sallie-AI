'use client';

import { useEffect } from 'react';

/**
 * Catches errors in the root layout. Renders its own html/body (root layout is not mounted).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-900 text-gray-100 font-sans antialiased flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-rose-500/20 bg-slate-800/80 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-rose-500/20" aria-hidden>
              <svg
                className="w-12 h-12 text-rose-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Something went wrong</h1>
          <p className="text-gray-400 text-sm mb-6">
            A critical error occurred. Please try again or go back home.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
            >
              Try again
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-violet-500/30 hover:border-violet-500/50 text-violet-200 hover:text-white font-medium transition-colors"
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
