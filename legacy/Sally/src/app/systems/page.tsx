import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function SystemsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const SYS = [
  { id: 'ghost', name: 'Ghost Interface', desc: 'Oversight and monitoring', href: '/systems/ghost' },
  { id: 'cli', name: 'CLI', desc: 'Command-line interface', href: '/systems/cli' },
  { id: 'veto', name: 'Veto', desc: 'Safety controls', href: '/systems/veto' },
  { id: 'foundry', name: 'Foundry', desc: 'Creation and ideation', href: '/systems/foundry' },
  { id: 'memory', name: 'Memory', desc: 'Persistent memory', href: '/systems/memory' },
  { id: 'voice', name: 'Voice', desc: 'Voice interface', href: '/systems/voice' },
  { id: 'undo', name: 'Undo', desc: 'Rollback', href: '/systems/undo' },
  { id: 'brainforge', name: 'Brainforge', desc: 'Cognitive layer', href: '/systems/brainforge' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SYS.map((s) => (
          <Link key={s.id} href={s.href} className="block rounded-xl border border-violet-500/20 bg-black/20 p-6 hover:border-violet-500/40">
            <h3 className="font-semibold text-white">{s.name}</h3>
            <p className="text-sm text-gray-400 mt-1">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export const metadata = { title: 'Systems — Sallie', description: 'Internal systems' };
