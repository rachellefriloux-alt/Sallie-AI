import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AvatarCustomization } from '@/components/avatar/AvatarCustomization';
import { ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'Avatar Workshop — Sallie',
  description: 'Create and customize your digital avatar',
};

export default async function AvatarPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sand-50 to-peacock-50 dark:from-slate-900 dark:to-slate-800 p-6 md:p-8">
      <header className="max-w-5xl mx-auto mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-peacock-700 dark:text-peacock-300 hover:text-peacock-900 dark:hover:text-peacock-100 text-sm font-medium transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden />
          Back to Sallie
        </Link>
        <h1 className="text-2xl font-bold text-peacock-900 dark:text-white tracking-tight">
          Avatar Workshop
        </h1>
        <p className="text-peacock-600 dark:text-peacock-400 mt-1">
          Choose a form and customize how Sallie appears across the app.
        </p>
      </header>

      <section className="max-w-5xl mx-auto">
        <AvatarCustomization />
      </section>
    </main>
  );
}
