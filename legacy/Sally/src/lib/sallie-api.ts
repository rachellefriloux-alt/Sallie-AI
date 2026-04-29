/**
 * Sallie API client. Routes through Next.js API routes at /api/*.
 * X-Actor-Id: localStorage sallie_actor_id when set (§13 Kinship).
 */

const DEFAULT_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

function getStoredBase(): string {
  try {
    const s = localStorage.getItem("sallie_api_base");
    return (s && s.trim()) ? s.trim() : DEFAULT_BASE;
  } catch {
    return DEFAULT_BASE;
  }
}

function getStoredActorId(): string | null {
  try {
    const s = localStorage.getItem("sallie_actor_id");
    return (s && s.trim()) ? s.trim() : null;
  } catch {
    return null;
  }
}

export function setApiBase(url: string): void {
  localStorage.setItem("sallie_api_base", url.trim());
}

export function setActorId(actorId: string | null): void {
  if (actorId == null || !actorId.trim()) localStorage.removeItem("sallie_actor_id");
  else localStorage.setItem("sallie_actor_id", actorId.trim());
}

export function getApiBase(): string {
  return getStoredBase();
}

export function getActorId(): string | null {
  return getStoredActorId();
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const base = getStoredBase();
  const url = `${base}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const actorId = getStoredActorId();
  if (actorId) headers["X-Actor-Id"] = actorId;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface LimbicState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: string;
  empathy?: number;
  intuition?: number;
  creativity?: number;
  wisdom?: number;
  humor?: number;
}

export interface ChatResponse {
  response: string;
  limbic_state: LimbicState;
  decision: Record<string, unknown>;
  timestamp: string;
}

export interface ConvergenceQuestion {
  id: string;
  phase?: number;
  title?: string;
  prompt: string;
}

export interface ConvergenceProgress {
  total: number;
  done: number;
  percent: number;
}

export type ConvergenceResponses = Record<
  string,
  { response: string; ts?: number }
>;

/** GET /v1/limbic/state */
export async function getLimbicState(): Promise<LimbicState> {
  return request<LimbicState>("/v1/limbic/state");
}

/** POST /chat — §9 File in chat: optional attachment_ids; ROADMAP Phase 2: optional thread_id for persistent threads */
export async function chat(
  text: string,
  attachmentIds?: string[],
  threadId?: string | null
): Promise<ChatResponse> {
  return request<ChatResponse>("/chat", {
    method: "POST",
    body: JSON.stringify({
      text: text || "",
      attachment_ids: attachmentIds ?? [],
      thread_id: threadId ?? undefined,
    }),
  });
}

/** POST /v1/files/upload — §9 File in chat: upload file, returns file_id for attachment_ids */
export async function uploadFile(file: File): Promise<{ file_id: string; name: string; size: number }> {
  const form = new FormData();
  form.append("file", file);
  const headers: Record<string, string> = {};
  const actorId = getStoredActorId();
  if (actorId) headers["X-Actor-Id"] = actorId;
  const res = await fetch(`${getStoredBase()}/v1/files/upload`, {
    method: "POST",
    headers,
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Upload failed ${res.status}`);
  }
  return res.json();
}

/** GET /v1/convergence/questions */
export async function getConvergenceQuestions(): Promise<ConvergenceQuestion[]> {
  return request<ConvergenceQuestion[]>("/v1/convergence/questions");
}

/** GET /v1/convergence/progress */
export async function getConvergenceProgress(): Promise<ConvergenceProgress> {
  return request<ConvergenceProgress>("/v1/convergence/progress");
}

/** GET /v1/convergence/responses */
export async function getConvergenceResponses(): Promise<ConvergenceResponses> {
  return request<ConvergenceResponses>("/v1/convergence/responses");
}

/** POST /v1/convergence/response */
export async function saveConvergenceResponse(
  questionId: string,
  response: string
): Promise<{ ok: boolean; question_id: string }> {
  return request("/v1/convergence/response", {
    method: "POST",
    body: JSON.stringify({ question_id: questionId, response }),
  });
}

/** POST /v1/convergence/compile */
export async function compileHeritage(): Promise<{ ok: boolean } & Record<string, unknown>> {
  return request("/v1/convergence/compile", { method: "POST" });
}

/** GET /health */
export async function getHealth(): Promise<{
  status: string;
  timestamp: number;
  degradation?: { state: string };
  limbic?: LimbicState;
}> {
  return request("/health");
}

/** GET /v1/auth/whoami — current actor, trust tier, capabilities (§13) */
export async function getWhoami(): Promise<{
  actor_id: string;
  trust: number;
  trust_tier: string;
  active_posture: string;
  capabilities: { can_write_drafts: boolean; can_modify_whitelist: boolean; can_execute_tools: boolean };
}> {
  return request("/v1/auth/whoami");
}

/** GET /v1/contracts — capability contracts (§8.4) */
export async function getContracts(): Promise<
  Array<{ tool: string; sandbox: string; dry_run: boolean; rollback: string }>
> {
  return request("/v1/contracts");
}

/** POST /v1/agency/rollback/{action_id} */
export async function rollbackAction(actionId: string): Promise<{ ok: boolean; error?: string }> {
  return request(`/v1/agency/rollback/${encodeURIComponent(actionId)}`, { method: "POST" });
}

/** GET /v1/working/now */
export async function getWorkingNow(): Promise<{ content: string }> {
  return request("/v1/working/now");
}

/** PUT /v1/working/now */
export async function setWorkingNow(content: string): Promise<{ ok: boolean }> {
  return request("/v1/working/now", {
    method: "PUT",
    body: JSON.stringify({ content }),
  });
}

/** POST /v1/voice/transcribe — §11.1.3 Voice UI: upload audio, get transcribed text */
export async function transcribeVoice(audioBlob: Blob): Promise<{ text: string }> {
  const form = new FormData();
  form.append("file", audioBlob, "audio.webm");
  const headers: Record<string, string> = {};
  const actorId = getStoredActorId();
  if (actorId) headers["X-Actor-Id"] = actorId;
  const res = await fetch(`${getStoredBase()}/v1/voice/transcribe`, {
    method: "POST",
    headers,
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Transcribe failed ${res.status}`);
  }
  return res.json();
}

/** GET /v1/voice/status */
export async function getVoiceStatus(): Promise<{
  stt: boolean;
  stt_whisper_lib?: boolean;
  stt_whisper_cli?: boolean;
  tts: boolean;
  tts_piper?: boolean;
  tts_pyttsx3?: boolean;
}> {
  return request("/v1/voice/status");
}

/** POST /v1/voice/speak — TTS; returns WAV audio blob for playback. */
export async function speakTts(text: string): Promise<Blob> {
  const base = getStoredBase();
  const url = `${base}/v1/voice/speak`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const actorId = getStoredActorId();
  if (actorId) headers["X-Actor-Id"] = actorId;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ text: text.slice(0, 2000) }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `HTTP ${res.status}`);
  }
  return res.blob();
}

/** GET /v1/sensors/patterns — §10.2.2 Pattern detection (workload spike, Git commit count/branch) */
export async function getSensorsPatterns(): Promise<{
  ts: number;
  workload_spike: boolean;
  total_files: number;
  idle_hours: number;
  threshold_files: number;
  git_commit_count: number | null;
  git_branch: string | null;
}> {
  return request("/v1/sensors/patterns");
}

/** GET /v1/sensors/load — §10.3 System Load Proxy (CPU, stress; optional psutil) */
export async function getSensorsLoad(): Promise<{
  ts: number;
  cpu_percent: number | null;
  stress: boolean;
  available: boolean;
}> {
  return request("/v1/sensors/load");
}

/** GET /v1/sensors/activity */
export async function getSensorsActivity(): Promise<{
  ts: number;
  working: { count: number; latest_mtime: number };
  drafts: { count: number; latest_mtime: number };
  total_files: number;
  idle_hours: number;
}> {
  return request("/v1/sensors/activity");
}

/** GET /v1/sensors/socratic-seed */
export async function getSocraticSeed(
  valence?: number,
  crisis?: boolean
): Promise<{ message: string | null; has_seed: boolean }> {
  const params = new URLSearchParams();
  if (valence != null) params.set("valence", String(valence));
  if (crisis) params.set("crisis", "true");
  const q = params.toString();
  return request(`/v1/sensors/socratic-seed${q ? `?${q}` : ""}`);
}

/** GET /v1/foundry/status */
export async function getFoundryStatus(): Promise<{
  status: string;
  message: string;
  latest_drift_report: string | null;
}> {
  return request("/v1/foundry/status");
}

/** POST /v1/foundry/run-eval */
export async function runFoundryEval(): Promise<{
  ok: boolean;
  tests: Array<{ prompt: string; status: string; reason: string; response?: string }>;
  passed: number;
  failed: number;
}> {
  return request("/v1/foundry/run-eval", { method: "POST" });
}

/** GET /v1/logs/thoughts */
export async function getThoughtsLog(tail?: number): Promise<{ content: string; lines: number; total_lines?: number }> {
  const q = tail != null ? `?tail=${tail}` : "";
  return request(`/v1/logs/thoughts${q}`);
}

/** GET /v1/shoulder-taps */
export interface ShoulderTap {
  id: string;
  message: string;
  suggestion_type: string;
  params: Record<string, unknown>;
  created_at: string;
  dismissed?: boolean;
}

export async function getShoulderTaps(limit = 10): Promise<{ taps: ShoulderTap[] }> {
  return request(`/v1/shoulder-taps?limit=${limit}`);
}

/** POST /v1/shoulder-taps/{tap_id}/dismiss */
export async function dismissShoulderTap(tapId: string): Promise<{ ok: boolean }> {
  return request(`/v1/shoulder-taps/${encodeURIComponent(tapId)}/dismiss`, { method: "POST" });
}

/** GET /v1/mindmap */
export interface MindMapNode {
  id: string;
  label: string;
  description: string;
  source_message_id?: string;
  created_at: number;
}

export interface MindMapEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  created_at: number;
}

export async function getMindMap(): Promise<{
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  updated_at: number | null;
}> {
  return request("/v1/mindmap");
}

export async function searchMindMap(q: string, limit = 50): Promise<{ nodes: MindMapNode[] }> {
  return request(`/v1/mindmap/search?q=${encodeURIComponent(q)}&limit=${limit}`);
}

export async function addMindMapNode(params: { label: string; description?: string; source_message_id?: string }): Promise<{ ok: boolean; node: MindMapNode }> {
  return request("/v1/mindmap/nodes", {
    method: "POST",
    body: JSON.stringify({
      label: params.label,
      description: params.description ?? "",
      source_message_id: params.source_message_id ?? null,
    }),
  });
}

export async function addMindMapEdge(params: { from_id: string; to_id: string; label?: string }): Promise<{ ok: boolean; edge: MindMapEdge }> {
  return request("/v1/mindmap/edges", {
    method: "POST",
    body: JSON.stringify({
      from_id: params.from_id,
      to_id: params.to_id,
      label: params.label ?? "",
    }),
  });
}

export async function deleteMindMapNode(nodeId: string): Promise<{ ok: boolean }> {
  return request(`/v1/mindmap/nodes/${encodeURIComponent(nodeId)}`, { method: "DELETE" });
}

export async function deleteMindMapEdge(edgeId: string): Promise<{ ok: boolean }> {
  return request(`/v1/mindmap/edges/${encodeURIComponent(edgeId)}`, { method: "DELETE" });
}

/** GET /v1/creative/status */
export async function getCreativeStatus(): Promise<{ image: boolean; music: boolean }> {
  return request("/v1/creative/status");
}

/** POST /v1/creative/image — returns Blob (image) */
export async function generateImage(prompt: string): Promise<Blob> {
  const base = getStoredBase();
  const url = `${base}/v1/creative/image`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const actorId = getStoredActorId();
  if (actorId) headers["X-Actor-Id"] = actorId;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
  return res.blob();
}

/** POST /v1/creative/music — returns Blob (audio) */
export async function generateMusic(prompt: string): Promise<Blob> {
  const base = getStoredBase();
  const url = `${base}/v1/creative/music`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const actorId = getStoredActorId();
  if (actorId) headers["X-Actor-Id"] = actorId;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
  return res.blob();
}

/** GET /v1/trading/journal */
export async function getTradingJournal(limit = 100): Promise<{ entries: Array<{ id: string; ts: number; symbol: string; note: string; outcome: string }> }> {
  return request(`/v1/trading/journal?limit=${limit}`);
}

/** POST /v1/trading/journal */
export async function addTradingJournalEntry(params: { symbol?: string; note?: string; outcome?: string }): Promise<{ ok: boolean; entry: Record<string, unknown> }> {
  return request("/v1/trading/journal", {
    method: "POST",
    body: JSON.stringify({
      symbol: params.symbol ?? "",
      note: params.note ?? "",
      outcome: params.outcome ?? "",
    }),
  });
}

/** GET /v1/business/plans */
export async function getBusinessPlans(limit = 100): Promise<{ plans: Array<{ id: string; ts: number; name: string; description: string; status: string }> }> {
  return request(`/v1/business/plans?limit=${limit}`);
}

/** POST /v1/business/plans */
export async function addBusinessPlan(params: { name: string; description?: string; status?: string }): Promise<{ ok: boolean; plan: Record<string, unknown> }> {
  return request("/v1/business/plans", {
    method: "POST",
    body: JSON.stringify({
      name: params.name,
      description: params.description ?? "",
      status: params.status ?? "draft",
    }),
  });
}

/** GET /v1/heritage */
export async function getHeritage(): Promise<{
  core: Record<string, unknown> | null;
  preferences: Record<string, unknown> | null;
  learned: Record<string, unknown> | null;
}> {
  return request("/v1/heritage");
}

/** GET /v1/foundry/drift-reports */
export async function getDriftReports(): Promise<{ reports: string[]; latest: string | null }> {
  return request("/v1/foundry/drift-reports");
}

/** GET /v1/hypotheses */
export async function getHypotheses(): Promise<Array<{ id: string; pattern: string; evidence: string[]; status: string }>> {
  return request("/v1/hypotheses");
}

/** POST /v1/hypotheses/{id}/confirm */
export async function confirmHypothesis(id: string): Promise<{ ok: boolean; hypothesis?: string }> {
  return request(`/v1/hypotheses/${id}/confirm`, { method: "POST" });
}

/** POST /v1/hypotheses/{id}/deny */
export async function denyHypothesis(id: string): Promise<{ ok: boolean }> {
  return request(`/v1/hypotheses/${id}/deny`, { method: "POST" });
}

/** GET /v1/sensors/focus */
export async function getFocusMode(): Promise<{
  focus_mode: boolean;
  quiet_hours_start: number;
  quiet_hours_end: number;
}> {
  return request("/v1/sensors/focus");
}

/** PUT /v1/sensors/focus */
export async function setFocusMode(params: {
  focus_mode: boolean;
  quiet_hours_start?: number;
  quiet_hours_end?: number;
}): Promise<{ ok: boolean; focus_mode: boolean; quiet_hours_start: number; quiet_hours_end: number }> {
  return request("/v1/sensors/focus", {
    method: "PUT",
    body: JSON.stringify({
      focus_mode: params.focus_mode,
      quiet_hours_start: params.quiet_hours_start ?? 22,
      quiet_hours_end: params.quiet_hours_end ?? 7,
    }),
  });
}

/** POST /v1/backup/run */
export async function runBackup(): Promise<{ ok: boolean; path: string; name: string }> {
  return request("/v1/backup/run", { method: "POST" });
}

/** GET /v1/backup/list */
export async function listBackups(): Promise<{ backups: string[] }> {
  return request("/v1/backup/list");
}

/** POST /v1/backup/restore — requires confirm: "RESTORE" */
export async function restoreBackup(backupId: string): Promise<{ ok: boolean; restored: string }> {
  return request("/v1/backup/restore", {
    method: "POST",
    body: JSON.stringify({ backup_id: backupId, confirm: "RESTORE" }),
  });
}

/** POST /v1/governance/forget — §23.4 Right-to-be-forgotten: purge by time range, actor_id, or tag */
export async function runForget(params: {
  target?: string;
  start?: number;
  end?: number;
  actor_id?: string | null;
  tag?: string | null;
}): Promise<{ ok: boolean; deleted: number }> {
  return request("/v1/governance/forget", {
    method: "POST",
    body: JSON.stringify({
      target: params.target ?? "time_range",
      start: params.start ?? 0,
      end: params.end ?? 0,
      actor_id: params.actor_id ?? undefined,
      tag: params.tag ?? undefined,
    }),
  });
}

/** POST /v1/governance/prune */
export async function runPrune(): Promise<{ ok: boolean; deleted: number; retention_days: number }> {
  return request("/v1/governance/prune", { method: "POST" });
}

/** POST /v1/governance/prune-raw — §10 raw data purge (sensor files older than raw_sensor_hours) */
export async function runPruneRaw(): Promise<{ ok: boolean; deleted: number; raw_sensor_hours: number }> {
  return request("/v1/governance/prune-raw", { method: "POST" });
}

/** GET /v1/governance/config-summary — §23 read-only (scheduled prune/backup, retention) */
export async function getGovernanceConfigSummary(): Promise<{
  retention_days: number;
  scheduled_prune_hours: number;
  scheduled_backup_hours: number;
}> {
  return request("/v1/governance/config-summary");
}

/** GET /v1/soul/topology — §2 Soul topology (heritage + limbic summary) */
export async function getSoulTopology(): Promise<{
  actor_id: string;
  heritage_keys: string[];
  limbic: LimbicState;
  mirror_test_excerpt: string | null;
  summary_length: number;
}> {
  return request("/v1/soul/topology");
}

/** GET /v1/shield/status — §2 Shield: block log, rate/repeated-block awareness */
export async function getShieldStatus(): Promise<{
  blocked_count: number;
  blocked_last_minute?: number;
  rate_limited?: boolean;
  repeated_block_detected?: boolean;
  repeated_block_count?: number;
  last_block_ts?: number | null;
  last_entries: Array<{ ts: number; reason: string }>;
  ok: boolean;
}> {
  return request("/v1/shield/status");
}

/** Proposed addons: Sallie can suggest capabilities for herself; Creator approves or rejects */
export interface ProposedAddon {
  id: string;
  title: string;
  description: string;
  proposed_at: string;
  proposed_by: string;
  status: "pending" | "approved" | "rejected";
  decided_at?: string | null;
  decided_note?: string | null;
}

export async function getProposedAddons(): Promise<{ addons: ProposedAddon[] }> {
  return request("/v1/addons/proposed");
}

export async function proposeAddon(title: string, description: string, proposedBy?: "sallie" | "creator"): Promise<ProposedAddon> {
  return request("/v1/addons/proposed", {
    method: "POST",
    body: JSON.stringify({ title, description, proposed_by: proposedBy ?? "creator" }),
  });
}

export async function decideAddon(addonId: string, status: "approved" | "rejected", note?: string): Promise<ProposedAddon> {
  return request(`/v1/addons/proposed/${addonId}`, {
    method: "PATCH",
    body: JSON.stringify({ status, note: note ?? null }),
  });
}

/** Reminders / follow-ups (Alexa, Meli parity) */
export interface Reminder {
  id: string;
  title: string;
  due_at?: string | null;
  note: string;
  created_at: string;
  status: "pending" | "completed";
  completed_at?: string | null;
}

export async function getReminders(): Promise<{ reminders: Reminder[]; pending_count: number }> {
  return request("/v1/reminders");
}

export async function addReminder(title: string, dueAt?: string | null, note?: string): Promise<Reminder> {
  return request("/v1/reminders", {
    method: "POST",
    body: JSON.stringify({ title, due_at: dueAt ?? null, note: note ?? "" }),
  });
}

export async function completeReminder(reminderId: string): Promise<Reminder> {
  return request(`/v1/reminders/${reminderId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "completed" }),
  });
}

/** Pending actions: Sallie proposes; Creator approves or rejects (reminders, addons, file_write, web_fetch) */
export interface PendingAction {
  id: string;
  type: string;
  params: Record<string, unknown>;
  proposed_by: string;
  proposed_at: string;
  note: string;
  status: "pending";
}

export async function getPendingActions(): Promise<{ actions: PendingAction[] }> {
  return request("/v1/pending-actions");
}

export async function approvePendingAction(actionId: string): Promise<PendingAction & { status: "approved" }> {
  return request(`/v1/pending-actions/${encodeURIComponent(actionId)}/approve`, { method: "POST" });
}

export async function rejectPendingAction(actionId: string, note?: string): Promise<PendingAction & { status: "rejected" }> {
  return request(`/v1/pending-actions/${encodeURIComponent(actionId)}/reject`, {
    method: "POST",
    body: JSON.stringify({ note: note ?? "" }),
  });
}

/** GET /v1/role — current archetype (BUSINESS, MOM, SPOUSE, FRIEND, ME, SANCTUARY or '') */
export async function getRole(): Promise<{ role: string }> {
  return request("/v1/role");
}

/** PUT /v1/role — set current role */
export async function setRole(role: string): Promise<{ role: string }> {
  return request("/v1/role", { method: "PUT", body: JSON.stringify({ role: role || "" }) });
}

/** GET /v1/roles — list all roles (archetypes + Sanctuary) for UI */
export async function listRoles(): Promise<{
  roles: Array<{
    key: string;
    identity: string;
    icon: string;
    label: string;
    desc: string;
    voice: string;
    interests?: string[];
    dreams?: string[];
  }>;
}> {
  return request("/v1/roles");
}

/** POST /v1/autonomous/cycle — trigger one autonomous think/learn/grow cycle */
export async function runAutonomousCycle(): Promise<{
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  reflection?: string | null;
  pending_added?: number;
  error?: string;
}> {
  return request("/v1/autonomous/cycle", { method: "POST" });
}

/** GET /v1/knowledge — §6.3 Defined knowledge base (6-tier) stats */
export interface KnowledgeStats {
  tier1: number;
  tier2: number;
  tier3: number;
  tier4: number;
  tier5: number;
  tier6: number;
  total_entries: number;
  tier_names: Record<string, string>;
}

export async function getKnowledgeStats(): Promise<KnowledgeStats> {
  return request("/v1/knowledge");
}

/** GET /v1/eyes/status — §2 Eyes: vision model available */
export async function getEyesStatus(): Promise<{ available: boolean }> {
  return request("/v1/eyes/status");
}

/** POST /v1/eyes/describe — §2 Eyes: describe image (file + optional prompt) */
export async function describeImage(file: File, prompt?: string): Promise<{ description: string; model: string }> {
  const form = new FormData();
  form.append("file", file);
  if (prompt != null && prompt.trim()) form.append("prompt", prompt.trim());
  const base = getStoredBase();
  const headers: Record<string, string> = {};
  const actorId = getStoredActorId();
  if (actorId) headers["X-Actor-Id"] = actorId;
  const res = await fetch(`${base}/v1/eyes/describe`, { method: "POST", headers, body: form });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Eyes describe failed ${res.status}`);
  }
  return res.json();
}

/** GET /v1/kinship/actors — §13 Kinship: list Creator + Kin actor_ids */
export async function getKinshipActors(): Promise<{ actors: string[]; default: string }> {
  return request("/v1/kinship/actors");
}

/** GET /v1/foundry/dataset-provenance — §12.3 Dataset governance */
export async function getFoundryDatasetProvenance(): Promise<{
  sources: Array<{ source_path: string; inclusion_reason: string; timestamp_range: string; redaction_status: string; consent_scope: string }>;
}> {
  return request("/v1/foundry/dataset-provenance");
}

/** GET /v1/foundry/promoted — §12.4.3 Two-stage promotion: last promoted */
export async function getFoundryPromoted(): Promise<{ promoted: boolean | null; timestamp: number | null; drift_report_id: string | null }> {
  return request("/v1/foundry/promoted");
}

/** POST /v1/foundry/promote — §12.4.3 Mark latest drift report as promoted */
export async function promoteFoundry(): Promise<{ ok: boolean; drift_report_id?: string; timestamp?: number; error?: string }> {
  return request("/v1/foundry/promote", { method: "POST" });
}

/** GET /v1/proactive/summary — ROADMAP Phase 1: Proactive before-you-ask (reminders, now, open loops) */
export async function getProactiveSummary(): Promise<{
  reminders_count: number;
  reminders_preview: string[];
  now_snippet: string;
  open_loops_count: number;
  open_loops_preview: string[];
  notice: string;
}> {
  return request("/v1/proactive/summary");
}

/** GET /v1/capabilities — ROADMAP Phase 1: Per-capability toggles (disabled + available) */
export async function getCapabilities(): Promise<{ disabled: string[]; available: string[] }> {
  return request("/v1/capabilities");
}

/** PUT /v1/capabilities — ROADMAP Phase 1: Set disabled capabilities */
export async function setCapabilities(disabled: string[]): Promise<{ disabled: string[]; available: string[] }> {
  return request("/v1/capabilities", { method: "PUT", body: JSON.stringify({ disabled }) });
}

/** GET /v1/agency/log — ROADMAP Phase 1: Why-did-you-do-that (last N actions with rationale) */
export async function getAgencyLog(limit?: number): Promise<{
  entries: Array<{
    ts: number;
    action_id: string;
    actor_id: string;
    tool: string;
    tier: number;
    params: Record<string, unknown>;
    result: string;
    rationale?: string | null;
    creator_override?: boolean;
  }>;
}> {
  const q = limit != null ? `?limit=${limit}` : "";
  return request(`/v1/agency/log${q}`);
}

/** PUT /v1/limbic/posture — ROADMAP Phase 1: Posture blending (canonical or blended string) */
export async function setLimbicPosture(posture: string): Promise<{ ok: boolean; posture: string }> {
  return request("/v1/limbic/posture", { method: "PUT", body: JSON.stringify({ posture: posture || "" }) });
}

/** POST /v1/repair/mistake — ROADMAP Phase 1: Mistake recovery ("I was wrong" + correction) */
export async function recordMistake(whatWasWrong: string, correction: string): Promise<{ ok: boolean; path?: string }> {
  return request("/v1/repair/mistake", {
    method: "POST",
    body: JSON.stringify({ what_was_wrong: whatWasWrong, correction }),
  });
}

/** ROADMAP Phase 2: Persistent threads */
export interface ThreadSummary {
  id: string;
  title: string;
  updated_ts: number;
  message_count: number;
  archived?: boolean;
}

export async function getThreads(limit?: number, includeArchived?: boolean): Promise<{ threads: ThreadSummary[] }> {
  const params = new URLSearchParams();
  if (limit != null) params.set("limit", String(limit));
  if (includeArchived === true) params.set("include_archived", "true");
  const q = params.toString() ? `?${params.toString()}` : "";
  return request(`/v1/threads${q}`);
}

export async function updateThread(
  threadId: string,
  patch: { title?: string; archived?: boolean }
): Promise<{ ok: boolean }> {
  return request(`/v1/threads/${encodeURIComponent(threadId)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function createThread(title?: string): Promise<ThreadSummary & { created_ts: number }> {
  return request("/v1/threads", {
    method: "POST",
    body: JSON.stringify({ title: title ?? "" }),
  });
}

export interface ThreadMessage {
  role: "user" | "assistant";
  content: string;
  ts?: number;
}

export async function getThread(threadId: string): Promise<{
  id: string;
  title: string;
  messages: ThreadMessage[];
  created_ts: number;
  updated_ts: number;
}> {
  return request(`/v1/threads/${encodeURIComponent(threadId)}`);
}

export const sallieApiBase = () => getStoredBase();
