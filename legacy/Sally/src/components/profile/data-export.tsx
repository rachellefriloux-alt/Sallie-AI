"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format as formatDate, subDays } from "date-fns";

type ExportFormat = "txt" | "json";

interface Props {
  userId: string;
}

export function DataExport({ userId }: Props) {
  const [exportFormat, setFormat] = useState<ExportFormat>("txt");
  const [startDate, setStartDate] = useState(
    formatDate(subDays(new Date(), 30), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(formatDate(new Date(), "yyyy-MM-dd"));
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleExport = async () => {
    setError(null);
    setDone(false);
    setProgress(10);

    const supabase = createClient();

    try {
      setProgress(20);

      const { data: conversations } = await supabase
        .from("conversations")
        .select("id, title, mode, created_at")
        .eq("user_id", userId)
        .gte("created_at", `${startDate}T00:00:00Z`)
        .lte("created_at", `${endDate}T23:59:59Z`)
        .order("created_at", { ascending: false });

      setProgress(50);

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

      setProgress(70);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const { data: heritageDna } = await supabase
        .from("heritage_dna")
        .select("*")
        .eq("user_id", userId)
        .single();

      const { data: streaks } = await supabase
        .from("streak_history")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      setProgress(90);

      const totalMessages = withMessages.reduce((s, c) => s + c.messages.length, 0);
      const exportData = {
        exportedAt: new Date().toISOString(),
        dateRange: { start: startDate, end: endDate },
        profile: profile ?? null,
        heritageDna: heritageDna ?? null,
        streakHistory: streaks ?? [],
        conversations: withMessages,
        stats: {
          totalConversations: withMessages.length,
          totalMessages,
        },
        shareableSummary: {
          conversations: withMessages.length,
          messages: totalMessages,
          dateRange: `${startDate} to ${endDate}`,
          heritageDnaComplete: !!heritageDna?.completed_at,
        },
      };

      setProgress(100);

      const blob =
        exportFormat === "json"
          ? new Blob([JSON.stringify(exportData, null, 2)], {
              type: "application/json",
            })
          : new Blob([formatAsText(exportData)], { type: "text/plain" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sallie-export-${formatDate(new Date(), "yyyy-MM-dd")}.${exportFormat}`;
      a.click();
      URL.revokeObjectURL(url);

      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setProgress(null);
    }
  };

  return (
    <section>
      <h2 className="text-lg font-medium text-heritage-800 mb-4">
        Export Your Data
      </h2>
      <p className="text-sm text-heritage-600 mb-4">
        Download your conversation history, profile, Heritage DNA, and streak
        data. Choose a date range and format.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-heritage-700 mb-1">
            Date range
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-heritage-300 bg-white text-heritage-800"
            />
            <span className="self-center text-heritage-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-heritage-300 bg-white text-heritage-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-heritage-700 mb-1">Format</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                checked={exportFormat === "txt"}
                onChange={() => setFormat("txt")}
                className="text-heritage-600"
              />
              <span className="text-heritage-700">Formatted text</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                checked={exportFormat === "json"}
                onChange={() => setFormat("json")}
                className="text-heritage-600"
              />
              <span className="text-heritage-700">JSON</span>
            </label>
          </div>
        </div>

        {progress !== null && (
          <div className="space-y-2">
            <div className="h-2 w-full rounded-full bg-heritage-200 overflow-hidden">
              <div
                className="h-full bg-heritage-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-heritage-500">
              {progress < 100 ? "Exporting…" : "Done"}
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {done && (
          <p className="text-sm text-green-600">Export downloaded successfully.</p>
        )}

        <button
          onClick={handleExport}
          disabled={progress !== null && progress < 100}
          className="px-6 py-2 rounded-lg bg-heritage-600 text-white hover:bg-heritage-700 disabled:opacity-60 transition-colors"
        >
          Export data
        </button>
      </div>
    </section>
  );
}

function formatAsText(data: {
  exportedAt: string;
  dateRange: { start: string; end: string };
  profile: unknown;
  heritageDna: unknown;
  streakHistory: unknown[];
  conversations: {
    id: string;
    title: string | null;
    mode: string | null;
    created_at: string;
    messages: { role: string; content: string; mode: string | null; created_at: string }[];
  }[];
  stats: { totalConversations: number; totalMessages: number };
}): string {
      const lines: string[] = [];

  lines.push("SALLIE DATA EXPORT");
  lines.push("==================");
  lines.push(`Exported: ${data.exportedAt}`);
  lines.push(`Date range: ${data.dateRange.start} to ${data.dateRange.end}`);
  lines.push("");
  lines.push("USAGE STATISTICS (Shareable Summary)");
  lines.push("-----------------------------------");
  lines.push(`Conversations: ${data.stats.totalConversations}`);
  lines.push(`Messages: ${data.stats.totalMessages}`);
  lines.push(`Heritage DNA: ${(data.heritageDna as { completed_at?: string } | null)?.completed_at ? "Complete" : "—"}`);
  lines.push("");

  for (const conv of data.conversations) {
    lines.push("---");
    lines.push(`Conversation: ${conv.title ?? "Untitled"} (${conv.mode ?? "default"})`);
    lines.push(`Started: ${conv.created_at}`);
    lines.push("");

    for (const msg of conv.messages) {
      lines.push(`[${msg.role}] ${msg.created_at}`);
      lines.push(msg.content);
      lines.push("");
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("END OF EXPORT");

  return lines.join("\n");
}
