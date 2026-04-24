import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const format = url.searchParams.get("format") ?? "json";
    const startDate = url.searchParams.get("start") ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const endDate = url.searchParams.get("end") ?? new Date().toISOString().split("T")[0];

    const { data: conversations } = await supabase
      .from("conversations")
      .select("id, title, mode, created_at")
      .eq("user_id", user.id)
      .gte("created_at", `${startDate}T00:00:00Z`)
      .lte("created_at", `${endDate}T23:59:59Z`)
      .order("created_at", { ascending: false });

    const withMessages = await Promise.all(
      (conversations ?? []).map(async (c) => {
        const { data: messages } = await supabase
          .from("messages")
          .select("role, content, mode, created_at")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: true });
        return { ...c, messages: messages ?? [] };
      })
    );

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const { data: heritageDna } = await supabase
      .from("heritage_dna")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: streaks } = await supabase
      .from("streak_history")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    const exportData = {
      exportedAt: new Date().toISOString(),
      dateRange: { start: startDate, end: endDate },
      profile: profile ?? null,
      heritageDna: heritageDna ?? null,
      streakHistory: streaks ?? [],
      conversations: withMessages,
      stats: {
        totalConversations: withMessages.length,
        totalMessages: withMessages.reduce((s: number, c: { messages: unknown[] }) => s + c.messages.length, 0),
      },
    };

    if (format === "txt") {
      const lines: string[] = [];
      lines.push("SALLIE DATA EXPORT");
      lines.push("==================");
      lines.push(`Exported: ${exportData.exportedAt}`);
      lines.push(`Date range: ${exportData.dateRange.start} to ${exportData.dateRange.end}`);
      lines.push("");
      lines.push("USAGE STATISTICS");
      lines.push("----------------");
      lines.push(`Conversations: ${exportData.stats.totalConversations}`);
      lines.push(`Messages: ${exportData.stats.totalMessages}`);
      lines.push("");

      for (const conv of exportData.conversations) {
        lines.push("---");
        lines.push(`Conversation: ${conv.title ?? "Untitled"} (${conv.mode ?? "default"})`);
        lines.push(`Started: ${conv.created_at}`);
        lines.push("");
        for (const msg of conv.messages as { role: string; content: string; created_at: string }[]) {
          lines.push(`[${msg.role}] ${msg.created_at}`);
          lines.push(msg.content);
          lines.push("");
        }
        lines.push("");
      }
      lines.push("---");
      lines.push("END OF EXPORT");

      return new Response(lines.join("\n"), {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="sallie-export-${exportData.exportedAt.split("T")[0]}.txt"`,
        },
      });
    }

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="sallie-export-${exportData.exportedAt.split("T")[0]}.json"`,
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Export failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
