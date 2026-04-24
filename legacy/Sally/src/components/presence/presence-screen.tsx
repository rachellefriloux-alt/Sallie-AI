"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Profile } from "@/types/database.types";

interface HeritageDna {
  answers?: Record<string, unknown>;
  completed_at?: string | null;
}

interface Props {
  profile?: Profile | null;
  heritageDna?: HeritageDna | null;
}

const POSTURES = ["Strategist", "Lioness", "Partner", "Friend"] as const;

export function PresenceScreen({ profile, heritageDna }: Props) {
  const posture = profile?.posture ?? "Friend";
  const emotionalState = profile?.emotional_state ?? "Present";
  const trust = (profile?.limbic_trust ?? 0.5) * 100;
  const warmth = (profile?.limbic_warmth ?? 0.5) * 100;
  const arousal = (profile?.limbic_arousal ?? 0.5) * 100;
  const valence = (profile?.limbic_valence ?? 0.5) * 100;
  const vectorCount = profile?.memory_vector_count ?? 0;
  const workingCount = profile?.memory_working_count ?? 0;
  const dreamCycleLast = profile?.dream_cycle_last_at;
  const heritageCount = heritageDna?.completed_at ? Object.keys(heritageDna.answers ?? {}).length : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Avatar with breathing effect */}
      <div className="flex justify-center">
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-heritage-400/30 blur-2xl -inset-4"
          />
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-heritage-300 bg-heritage-200 flex items-center justify-center breath-glow">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="Sallie"
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-6xl text-heritage-500">✦</span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap justify-center gap-3">
        <span className="px-3 py-1 rounded-full bg-heritage-200 text-heritage-700 text-sm">
          {emotionalState}
        </span>
        <span className="px-3 py-1 rounded-full bg-heritage-300/80 text-heritage-800 text-sm font-medium">
          {posture}
        </span>
      </div>

      {/* Limbic meters */}
      <section>
        <h3 className="text-sm font-medium text-heritage-600 mb-4 uppercase tracking-wider">
          Limbic Engine
        </h3>
        <div className="space-y-4">
          <MeterBar label="Trust" value={trust} color="limbic-trust" />
          <MeterBar label="Warmth" value={warmth} color="limbic-warmth" />
          <MeterBar label="Arousal" value={arousal} color="limbic-arousal" />
          <MeterBar label="Valence" value={valence} color="limbic-valence" />
        </div>
      </section>

      {/* Memory Trinity */}
      <section>
        <h3 className="text-sm font-medium text-heritage-600 mb-4 uppercase tracking-wider">
          Memory Trinity
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <MemoryCard
            title="Heritage DNA"
            count={heritageCount}
            subtitle="30 questions"
            icon="✦"
          />
          <MemoryCard
            title="Vector Memory"
            count={vectorCount}
            subtitle="embeddings"
            icon="◇"
          />
          <MemoryCard
            title="Working Memory"
            count={workingCount}
            subtitle="active context"
            icon="◆"
          />
        </div>
      </section>

      {/* Dream Cycle */}
      <section>
        <h3 className="text-sm font-medium text-heritage-600 mb-2 uppercase tracking-wider">
          Dream Cycle
        </h3>
        <p className="text-heritage-700">
          Last processed:{" "}
          {dreamCycleLast
            ? new Date(dreamCycleLast).toLocaleString()
            : "Not yet run"}
        </p>
      </section>
    </div>
  );
}

function MeterBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    "limbic-trust": "bg-limbic-trust",
    "limbic-warmth": "bg-amber-500",
    "limbic-arousal": "bg-purple-500",
    "limbic-valence": "bg-cyan-600",
  };
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-heritage-700">{label}</span>
        <span className="text-heritage-500">{Math.round(value)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-heritage-200 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${colorClasses[color] ?? "bg-heritage-500"}`}
        />
      </div>
    </div>
  );
}

function MemoryCard({
  title,
  count,
  subtitle,
  icon,
}: {
  title: string;
  count: number;
  subtitle: string;
  icon: string;
}) {
  return (
    <div className=" rounded-lg border border-heritage-200 bg-heritage-50/50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-heritage-500">{icon}</span>
        <span className="text-sm font-medium text-heritage-800">{title}</span>
      </div>
      <p className="text-2xl font-serif text-heritage-700">{count}</p>
      <p className="text-xs text-heritage-500">{subtitle}</p>
    </div>
  );
}
