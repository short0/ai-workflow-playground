import type { Mode, RunRecord, Settings } from "./types";

const KEYS = {
  theme: "cup.theme",
  mode: "cup.mode",
  preset: "cup.selectedPreset",
  goal: "cup.goalDraft",
  notes: "cup.notes",
  recentGoals: "cup.recentGoals",
  runHistory: "cup.runHistory",
  settings: "cup.settings",
  liveAck: "cup.liveAck",
} as const;

function isBrowser() {
  return typeof window !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

export const storage = {
  KEYS,
  getTheme: () => read<"light" | "dark">(KEYS.theme, "light"),
  setTheme: (v: "light" | "dark") => write(KEYS.theme, v),

  getMode: () => read<Mode>(KEYS.mode, "simulated"),
  setMode: (v: Mode) => write(KEYS.mode, v),

  getPreset: () => read<string>(KEYS.preset, "expense-form"),
  setPreset: (v: string) => write(KEYS.preset, v),

  getGoal: () => read<string>(KEYS.goal, ""),
  setGoal: (v: string) => write(KEYS.goal, v),

  getNotes: () => read<string>(KEYS.notes, ""),
  setNotes: (v: string) => write(KEYS.notes, v),

  getRecentGoals: () => read<string[]>(KEYS.recentGoals, []),
  pushRecentGoal: (goal: string) => {
    const list = storage.getRecentGoals().filter((g) => g !== goal);
    list.unshift(goal);
    write(KEYS.recentGoals, list.slice(0, 10));
  },

  getRunHistory: () => read<RunRecord[]>(KEYS.runHistory, []),
  pushRun: (r: RunRecord) => {
    const list = storage.getRunHistory();
    // keep last 5 per preset
    const grouped: Record<string, RunRecord[]> = {};
    for (const item of [r, ...list]) {
      grouped[item.presetId] ??= [];
      if (grouped[item.presetId].length < 5) grouped[item.presetId].push(item);
    }
    const flat = Object.values(grouped).flat().sort((a, b) => b.endedAt - a.endedAt);
    write(KEYS.runHistory, flat);
  },
  clearRuns: () => write(KEYS.runHistory, []),

  getSettings: (): Settings =>
    read<Settings>(KEYS.settings, { speed: 900, autoAdvance: false, showReasoning: true }),
  setSettings: (s: Settings) => write(KEYS.settings, s),

  getLiveAck: () => read<boolean>(KEYS.liveAck, false),
  setLiveAck: (v: boolean) => write(KEYS.liveAck, v),
};