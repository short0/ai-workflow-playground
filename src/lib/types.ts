export type StepKind =
  | "goal"
  | "plan"
  | "click"
  | "type"
  | "observe"
  | "extract"
  | "verify";

export interface Step {
  id: string;
  kind: StepKind;
  /** Short label, e.g. "Click Submit" */
  label: string;
  /** Target selector / human description of where the action happens */
  target?: string;
  /** Plain-language explanation for beginners */
  explain: string;
  /** What the agent observes after this step */
  observation?: string;
  /** Reasoning for why this step was chosen */
  reasoning?: string;
  /** Key/value pairs extracted at this step */
  extracted?: Record<string, string>;
  /** Which screen state to render after this step */
  screen: string;
}

export interface VerificationCheck {
  label: string;
  pass: boolean;
  reason: string;
}

export interface Preset {
  id: string;
  title: string;
  purpose: string;
  goal: string;
  estSteps: number;
  quickPrompts: string[];
  steps: Step[];
  verification: VerificationCheck[];
  finalExtract?: Record<string, string>;
}

export type Mode = "simulated" | "live";

export interface Settings {
  speed: number; // ms per step when auto-advancing
  autoAdvance: boolean;
  showReasoning: boolean;
}

export interface RunRecord {
  id: string;
  presetId: string;
  goal: string;
  mode: Mode;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  passed: boolean;
  extracted: Record<string, string>;
  stepCount: number;
}

export interface SessionState {
  selectedPresetId: string;
  goal: string;
  mode: Mode;
  stepIndex: number;
  notes: string;
  settings: Settings;
}