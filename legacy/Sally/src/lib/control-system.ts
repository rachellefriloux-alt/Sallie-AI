export interface ControlOverride {
  actionId: string;
  originalValue: unknown;
  overrideValue: unknown;
  reason: string;
  createdAt: string;
}

export interface ControlState {
  paused: boolean;
  overrides: Record<string, ControlOverride>;
  autonomyLevel: number;
  allowedActions: string[];
  pausedAt: string | null;
  resumedAt: string | null;
  lastModified: string;
}

const userControlStates = new Map<string, ControlState>();

function getDefaultState(): ControlState {
  return {
    paused: false,
    overrides: {},
    autonomyLevel: 0.7,
    allowedActions: [],
    pausedAt: null,
    resumedAt: null,
    lastModified: new Date().toISOString(),
  };
}

export function getControlState(userId: string): ControlState {
  if (!userControlStates.has(userId)) {
    userControlStates.set(userId, getDefaultState());
  }
  return { ...userControlStates.get(userId)! };
}

export function pauseActions(
  userId: string,
  allowedActions: string[] = []
): ControlState {
  const state = getControlState(userId);
  state.paused = true;
  state.pausedAt = new Date().toISOString();
  state.allowedActions = allowedActions;
  state.lastModified = new Date().toISOString();
  userControlStates.set(userId, state);
  return { ...state };
}

export function resumeActions(userId: string): ControlState {
  const state = getControlState(userId);
  state.paused = false;
  state.resumedAt = new Date().toISOString();
  state.allowedActions = [];
  state.lastModified = new Date().toISOString();
  userControlStates.set(userId, state);
  return { ...state };
}

export function setAutonomyLevel(
  userId: string,
  level: number
): ControlState {
  const clamped = Math.max(0, Math.min(1, level));
  const state = getControlState(userId);
  state.autonomyLevel = clamped;
  state.lastModified = new Date().toISOString();
  userControlStates.set(userId, state);
  return { ...state };
}

export function addOverride(
  userId: string,
  actionId: string,
  originalValue: unknown,
  overrideValue: unknown,
  reason: string
): ControlState {
  const state = getControlState(userId);
  state.overrides[actionId] = {
    actionId,
    originalValue,
    overrideValue,
    reason,
    createdAt: new Date().toISOString(),
  };
  state.lastModified = new Date().toISOString();
  userControlStates.set(userId, state);
  return { ...state };
}

export function removeOverride(
  userId: string,
  actionId: string
): ControlState {
  const state = getControlState(userId);
  delete state.overrides[actionId];
  state.lastModified = new Date().toISOString();
  userControlStates.set(userId, state);
  return { ...state };
}

export function isActionAllowed(userId: string, action: string): boolean {
  const state = getControlState(userId);
  if (!state.paused) return true;
  return state.allowedActions.includes(action);
}

export function resetControlState(userId: string): ControlState {
  const state = getDefaultState();
  userControlStates.set(userId, state);
  return { ...state };
}
