import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function SystemsLayout(props: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="border-b border-violet-500/20 bg-black/20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="text-violet-300 hover:text-white text-sm">Back</Link>
          <h1 className="text-2xl font-bold text-white mt-2">Systems</h1>
          <nav className="flex flex-wrap gap-2 mt-4">
            <Link href="/systems" className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-violet-500/20">Overview</Link>
            <Link href="/systems/ghost" className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-violet-500/20">Ghost</Link>
            <Link href="/systems/cli" className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-violet-500/20">CLI</Link>
            <Link href="/systems/veto" className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-violet-500/20">Veto</Link>
            <Link href="/systems/foundry" className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-violet-500/20">Foundry</Link>
            <Link href="/systems/memory" className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-violet-500/20">Memory</Link>
            <Link href="/systems/voice" className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-violet-500/20">Voice</Link>
            <Link href="/systems/undo" className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-violet-500/20">Undo</Link>
            <Link href="/systems/brainforge" className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-violet-500/20">Brainforge</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{props.children}</main>
    </div>
  );
}
