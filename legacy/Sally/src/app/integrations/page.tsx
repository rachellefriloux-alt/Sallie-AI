'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { IntegrationsManager } from '@/components/IntegrationsManager';

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
        <IntegrationsManager />
      </div>
    </div>
  );
}
