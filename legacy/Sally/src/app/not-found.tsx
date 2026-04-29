import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full rounded-2xl border border-violet-500/20 bg-black/30 backdrop-blur-sm p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-violet-500/20">
            <Compass className="w-12 h-12 text-violet-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">404</h1>
        <p className="text-gray-400 mb-6">This page doesn&apos;t exist or has moved.</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
        >
          Back to Sallie
        </Link>
      </div>
    </main>
  );
}
