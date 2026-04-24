import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      // Create user profile if it doesn't exist
      try {
        await prisma.profile.upsert({
          where: { id: data.user.id },
          create: {
            id: data.user.id,
            displayName: data.user.user_metadata?.full_name ?? null,
            avatarUrl: null,
            convergenceCompleted: false,
          },
          update: {},
        });
      } catch (profileError) {
        console.error("Failed to create user profile:", profileError);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth`);
}
