import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="border-b border-violet-500/20 bg-black/20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex gap-2 text-violet-300 hover:text-white text-sm font-medium mb-4">← Back to Sallie</Link>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <nav className="flex gap-2 mt-4">
            <Link href="/analytics" className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-violet-500/20">Overview</Link>
            <Link href="/analytics/performance" className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-violet-500/20">Performance</Link>
            <Link href="/analytics/usage" className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-violet-500/20">Usage</Link>
            <Link href="/analytics/system" className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-violet-500/20">System</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
