import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PresenceScreen } from "@/components/presence/presence-screen";

export default async function PresencePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: heritageDna } = await supabase
    .from("heritage_dna")
    .select("answers, completed_at")
    .eq("user_id", user.id)
    .single();

  return (
    <main className="min-h-screen p-8">
      <header className="flex items-center justify-between max-w-4xl mx-auto mb-8">
        <Link href="/" className="text-heritage-600 hover:text-heritage-800">
          ← Home
        </Link>
        <h1 className="text-xl font-serif text-heritage-800">Sallie Presence</h1>
      </header>

      <PresenceScreen
        profile={profile ?? undefined}
        heritageDna={heritageDna ?? undefined}
      />
    </main>
  );
}
