'use client';

import { LimbicScreen } from '@/components/LimbicScreen';

export default function LimbicPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Limbic Engine</h1>
          <p className="text-gray-300">Monitor and manage Sallie's emotional state and cognitive patterns</p>
        </div>
        
        <LimbicScreen />
      </div>
    </div>
  );
}

