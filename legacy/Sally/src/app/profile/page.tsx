import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DataExport } from "@/components/profile/data-export";

export default async function ProfilePage() {
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

  const { count: conversationCount } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <main className="min-h-screen p-8">
      <header className="flex items-center justify-between max-w-4xl mx-auto mb-8">
        <Link href="/" className="text-heritage-600 hover:text-heritage-800">
          ← Home
        </Link>
        <h1 className="text-xl font-serif text-heritage-800">Profile</h1>
      </header>

      <div className="max-w-xl mx-auto space-y-8">
        <section>
          <h2 className="text-lg font-medium text-heritage-800 mb-2">
            Account
          </h2>
          <p className="text-heritage-600">{user.email}</p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-heritage-800 mb-4">
            Usage
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-heritage-200 p-4">
              <p className="text-2xl font-serif text-heritage-700">
                {conversationCount ?? 0}
              </p>
              <p className="text-sm text-heritage-500">Conversations</p>
            </div>
            <div className="rounded-lg border border-heritage-200 p-4">
              <p className="text-2xl font-serif text-heritage-700">
                {heritageDna?.completed_at ? "Complete" : "—"}
              </p>
              <p className="text-sm text-heritage-500">Heritage DNA</p>
            </div>
          </div>
        </section>

        <DataExport userId={user.id} />
      </div>
    </main>
  );
}
