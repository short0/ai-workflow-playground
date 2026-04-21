import * as React from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  RefreshCw,
  Undo2,
  Redo2,
  Info,
  Check,
  X,
  GitCompare,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { MockScreen } from "@/components/mock-screen";
import { StepChip, StepLegend } from "@/components/step-chip";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PRESETS, getPreset } from "@/lib/presets";
import { storage } from "@/lib/storage";
import { useHistoryState } from "@/hooks/use-history-state";
import type { Mode, RunRecord, SessionState, Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SearchParams {
  preset?: string;
}

export const Route = createFileRoute("/playground")({
  head: () => ({
    meta: [
      { title: "Playground — Computer Use Playground" },
      {
        name: "description",
        content:
          "Hands-on sandbox to watch an AI agent plan, act, observe, and verify a task using mocked screens.",
      },
      { property: "og:title", content: "Playground — Computer Use Playground" },
      {
        property: "og:description",
        content: "Step through a computer-use AI agent on safe, mocked workflows.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    preset: typeof search.preset === "string" ? search.preset : undefined,
  }),
  component: PlaygroundPage,
});

function makeInitial(presetIdParam: string | undefined): SessionState {
  const presetId = presetIdParam ?? storage.getPreset();
  const preset = getPreset(presetId);
  const storedGoal = storage.getGoal();
  return {
    selectedPresetId: preset.id,
    goal: storedGoal && storedGoal.length > 0 ? storedGoal : preset.goal,
    mode: storage.getMode(),
    stepIndex: 0,
    notes: storage.getNotes(),
    settings: storage.getSettings(),
  };
}

function PlaygroundPage() {
  const search = useSearch({ from: "/playground" });
  const initial = React.useMemo(() => makeInitial(search.preset), [search.preset]);

  const history = useHistoryState<SessionState>(initial);
  const session = history.value;
  const preset = getPreset(session.selectedPresetId);
  const totalSteps = preset.steps.length;
  const stepIndex = Math.min(session.stepIndex, totalSteps - 1);
  const currentStep = preset.steps[stepIndex];

  const [playing, setPlaying] = React.useState(false);
  const [explainOpen, setExplainOpen] = React.useState(false);
  const [liveDialog, setLiveDialog] = React.useState(false);
  const [compareOpen, setCompareOpen] = React.useState(false);
  const [recorded, setRecorded] = React.useState(false);

  // Persist key fields
  React.useEffect(() => storage.setPreset(session.selectedPresetId), [session.selectedPresetId]);
  React.useEffect(() => storage.setGoal(session.goal), [session.goal]);
  React.useEffect(() => storage.setMode(session.mode), [session.mode]);
  React.useEffect(() => storage.setNotes(session.notes), [session.notes]);
  React.useEffect(() => storage.setSettings(session.settings), [session.settings]);

  // Auto-advance
  React.useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => {
      if (stepIndex >= totalSteps - 1) {
        setPlaying(false);
        return;
      }
      history.replace((s) => ({ ...s, stepIndex: s.stepIndex + 1 }));
    }, session.settings.speed);
    return () => window.clearTimeout(id);
  }, [playing, stepIndex, totalSteps, session.settings.speed, history]);

  // Record run when reaching the final step
  React.useEffect(() => {
    if (stepIndex === totalSteps - 1 && !recorded) {
      const passed = preset.verification.every((v) => v.pass);
      const record: RunRecord = {
        id: `${preset.id}-${Date.now()}`,
        presetId: preset.id,
        goal: session.goal,
        mode: session.mode,
        startedAt: Date.now() - totalSteps * session.settings.speed,
        endedAt: Date.now(),
        durationMs: totalSteps * session.settings.speed,
        passed,
        extracted: preset.finalExtract ?? {},
        stepCount: totalSteps,
      };
      storage.pushRun(record);
      storage.pushRecentGoal(session.goal);
      setRecorded(true);
    }
  }, [stepIndex, totalSteps, recorded, preset, session.goal, session.mode, session.settings.speed]);

  // Keyboard shortcuts: undo/redo
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        history.undo();
      } else if ((e.key.toLowerCase() === "z" && e.shiftKey) || e.key.toLowerCase() === "y") {
        e.preventDefault();
        history.redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [history]);

  // Actions ------------------------------------------------
  const setPreset = (id: string) => {
    const p = getPreset(id);
    history.set((s) => ({ ...s, selectedPresetId: id, goal: p.goal, stepIndex: 0 }));
    setPlaying(false);
    setRecorded(false);
  };

  const setGoal = (goal: string) => history.set((s) => ({ ...s, goal }));
  const setMode = (mode: Mode) => {
    if (mode === "live" && !storage.getLiveAck()) {
      setLiveDialog(true);
      return;
    }
    history.set((s) => ({ ...s, mode }));
  };
  const confirmLive = () => {
    storage.setLiveAck(true);
    history.set((s) => ({ ...s, mode: "live" }));
    setLiveDialog(false);
  };

  const setSettings = (next: Partial<Settings>) =>
    history.set((s) => ({ ...s, settings: { ...s.settings, ...next } }));

  const goStep = (i: number) => {
    history.replace((s) => ({ ...s, stepIndex: Math.max(0, Math.min(totalSteps - 1, i)) }));
    if (i < totalSteps - 1) setRecorded(false);
  };

  const replay = () => {
    history.set((s) => ({ ...s, stepIndex: 0 }));
    setRecorded(false);
    setPlaying(true);
  };

  const sessionReset = () => {
    history.set((s) => ({ ...s, stepIndex: 0, goal: preset.goal }));
    setPlaying(false);
    setRecorded(false);
  };

  const fullReset = () => {
    setPlaying(false);
    setRecorded(false);
    const fresh = makeInitial(undefined);
    history.reset(fresh);
  };

  // Derived ------------------------------------------------
  const visibleSteps = preset.steps.slice(0, stepIndex + 1);
  const runs = storage.getRunHistory().filter((r) => r.presetId === preset.id).slice(0, 5);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader onReset={fullReset} />

      {/* Mobile sticky controls */}
      <div className="sticky top-14 z-30 flex items-center gap-1.5 border-b border-border bg-background/90 px-3 py-2 backdrop-blur lg:hidden">
        <ModeBadge mode={session.mode} />
        <div className="ml-auto flex gap-1">
          <IconBtn label="Prev" onClick={() => goStep(stepIndex - 1)} disabled={stepIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </IconBtn>
          <IconBtn
            label={playing ? "Pause" : "Play"}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </IconBtn>
          <IconBtn
            label="Next"
            onClick={() => goStep(stepIndex + 1)}
            disabled={stepIndex >= totalSteps - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </IconBtn>
          <IconBtn label="Undo" onClick={history.undo} disabled={!history.canUndo}>
            <Undo2 className="h-4 w-4" />
          </IconBtn>
          <IconBtn label="Redo" onClick={history.redo} disabled={!history.canRedo}>
            <Redo2 className="h-4 w-4" />
          </IconBtn>
          <IconBtn label="Reset session" onClick={sessionReset}>
            <RotateCcw className="h-4 w-4" />
          </IconBtn>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl gap-4 px-3 py-4 sm:px-6 sm:py-6 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
        {/* LEFT — Setup */}
        <aside className="space-y-4">
          <Section title="Preset">
            <Select value={session.selectedPresetId} onValueChange={setPreset}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESETS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-2 text-xs text-muted-foreground">{preset.purpose}</p>
          </Section>

          <Section title="Goal">
            <Textarea
              value={session.goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
              className="resize-none text-sm"
              placeholder="Describe the goal for the agent…"
            />
          </Section>

          <Section title="Mode">
            <div className="flex gap-1.5">
              <ModeButton
                active={session.mode === "simulated"}
                onClick={() => setMode("simulated")}
                tone="sim"
                label="Simulated"
                hint="Default · safe"
              />
              <ModeButton
                active={session.mode === "live"}
                onClick={() => setMode("live")}
                tone="live"
                label="Live LLM"
                hint="Advanced"
              />
            </div>
          </Section>

          <Section title="Quick prompts">
            <div className="flex flex-wrap gap-1.5">
              {preset.quickPrompts.map((q) => (
                <button
                  key={q}
                  onClick={() => setGoal(q)}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-accent"
                >
                  {q}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Settings">
            <div className="space-y-3">
              <div>
                <Label className="mb-1.5 flex justify-between text-xs">
                  <span>Playback speed</span>
                  <span className="text-muted-foreground">{session.settings.speed}ms</span>
                </Label>
                <Slider
                  min={300}
                  max={2000}
                  step={100}
                  value={[session.settings.speed]}
                  onValueChange={([v]) => setSettings({ speed: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto" className="text-xs">Auto-advance</Label>
                <Switch
                  id="auto"
                  checked={session.settings.autoAdvance}
                  onCheckedChange={(v) => setSettings({ autoAdvance: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="reason" className="text-xs">Show reasoning</Label>
                <Switch
                  id="reason"
                  checked={session.settings.showReasoning}
                  onCheckedChange={(v) => setSettings({ showReasoning: v })}
                />
              </div>
            </div>
          </Section>

          <Section title="Notes">
            <Textarea
              value={session.notes}
              onChange={(e) => history.replace((s) => ({ ...s, notes: e.target.value }))}
              rows={3}
              placeholder="Jot down what you learned…"
              className="resize-none text-sm"
            />
          </Section>
        </aside>

        {/* CENTER — Run stage */}
        <section className="space-y-4">
          {session.mode === "live" && (
            <div
              className="flex items-start gap-2 rounded-md border px-3 py-2 text-xs"
              style={{
                backgroundColor: "var(--mode-live-bg)",
                color: "var(--mode-live)",
                borderColor: "transparent",
              }}
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>Live mode</strong> — outputs come from a real model. Screens stay mocked
                for safety.
              </span>
            </div>
          )}

          <MockScreen screen={currentStep.screen} />

          {/* Step controls */}
          <div className="hidden flex-wrap items-center gap-1.5 lg:flex">
            <ModeBadge mode={session.mode} />
            <span className="ml-2 text-xs text-muted-foreground">
              Step {stepIndex + 1} / {totalSteps}
            </span>
            <div className="ml-auto flex gap-1">
              <IconBtn label="Prev" onClick={() => goStep(stepIndex - 1)} disabled={stepIndex === 0}>
                <ChevronLeft className="h-4 w-4" />
              </IconBtn>
              <IconBtn
                label={playing ? "Pause" : "Play"}
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </IconBtn>
              <IconBtn
                label="Next"
                onClick={() => goStep(stepIndex + 1)}
                disabled={stepIndex >= totalSteps - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </IconBtn>
              <IconBtn label="Replay" onClick={replay}>
                <RefreshCw className="h-4 w-4" />
              </IconBtn>
              <IconBtn label="Undo" onClick={history.undo} disabled={!history.canUndo}>
                <Undo2 className="h-4 w-4" />
              </IconBtn>
              <IconBtn label="Redo" onClick={history.redo} disabled={!history.canRedo}>
                <Redo2 className="h-4 w-4" />
              </IconBtn>
              <IconBtn label="Reset session" onClick={sessionReset}>
                <RotateCcw className="h-4 w-4" />
              </IconBtn>
            </div>
          </div>

          {/* Action timeline */}
          <Section
            title="Action timeline"
            right={<StepLegend />}
          >
            <ol className="space-y-1.5">
              {preset.steps.map((s, i) => {
                const done = i < stepIndex;
                const active = i === stepIndex;
                const future = i > stepIndex;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => goStep(i)}
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-md border px-2.5 py-2 text-left text-sm transition-colors",
                        active
                          ? "border-ring bg-accent/60"
                          : "border-border hover:bg-accent/40",
                        future && "opacity-60",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium",
                          done
                            ? "bg-primary text-primary-foreground"
                            : active
                              ? "border border-ring text-foreground"
                              : "border border-border text-muted-foreground",
                        )}
                      >
                        {done ? <Check className="h-3 w-3" /> : i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <StepChip kind={s.kind} />
                          <span className="truncate font-medium">{s.label}</span>
                        </div>
                        {s.target && (
                          <div className="mt-0.5 truncate text-xs text-muted-foreground">
                            {s.target}
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </Section>

          {/* Current step explanation */}
          <Section
            title="Current step"
            right={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExplainOpen((o) => !o)}
                className="h-7 gap-1.5 text-xs"
              >
                <Info className="h-3.5 w-3.5" />
                {explainOpen ? "Hide explanation" : "Explain this step"}
              </Button>
            }
          >
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <StepChip kind={currentStep.kind} />
                <span className="font-medium">{currentStep.label}</span>
              </div>
              {currentStep.target && (
                <div className="text-xs text-muted-foreground">→ {currentStep.target}</div>
              )}
              {explainOpen && (
                <p className="rounded-md border border-border bg-muted/40 p-3 text-sm leading-relaxed">
                  {currentStep.explain}
                </p>
              )}
            </div>
          </Section>
        </section>

        {/* RIGHT — Insight */}
        <aside className="space-y-4">
          <Section title="Observation">
            <p className="text-sm leading-relaxed text-foreground">
              {currentStep.observation ?? (
                <span className="text-muted-foreground">— no observation for this step</span>
              )}
            </p>
          </Section>

          <Section title="Extracted results">
            <ExtractTable rows={collectExtracts(visibleSteps)} />
          </Section>

          {session.settings.showReasoning && (
            <Section title="Reasoning">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {currentStep.reasoning ?? "No reasoning recorded for this step."}
              </p>
            </Section>
          )}

          <Section title="Verification">
            {stepIndex < totalSteps - 1 ? (
              <p className="text-sm text-muted-foreground">
                Verification appears after the run finishes.
              </p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {preset.verification.map((v) => (
                  <li
                    key={v.label}
                    className="flex items-start gap-2 rounded-md border border-border px-2.5 py-1.5"
                  >
                    {v.pass ? (
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: "var(--mode-sim)" }}
                      />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium">{v.label}</div>
                      <div className="text-xs text-muted-foreground">{v.reason}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section
            title="Run history"
            right={
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs"
                onClick={() => setCompareOpen(true)}
                disabled={runs.length < 2}
              >
                <GitCompare className="h-3.5 w-3.5" />
                Compare runs
              </Button>
            }
          >
            {runs.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Finish a run to see it here. Last 5 per preset are saved.
              </p>
            ) : (
              <ul className="space-y-1 text-xs">
                {runs.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between rounded-md border border-border px-2.5 py-1.5"
                  >
                    <span className="truncate">
                      {new Date(r.endedAt).toLocaleTimeString()} · {r.mode}
                    </span>
                    <span style={{ color: r.passed ? "var(--mode-sim)" : "var(--destructive)" }}>
                      {r.passed ? "pass" : "fail"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </aside>
      </main>

      {/* Live mode confirm */}
      <Dialog open={liveDialog} onOpenChange={setLiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Enable Live LLM mode?
            </DialogTitle>
            <DialogDescription>
              Live mode replaces simulated reasoning with calls to a real model. Screens stay
              fully mocked — no real systems are touched. You can switch back any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLiveDialog(false)}>
              Stay simulated
            </Button>
            <Button onClick={confirmLive}>Enable Live</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compare runs */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compare last two runs</DialogTitle>
            <DialogDescription>
              Side-by-side diff of the last two completed runs for{" "}
              <strong>{preset.title}</strong>.
            </DialogDescription>
          </DialogHeader>
          <CompareRuns a={runs[0]} b={runs[1]} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- helpers / subcomponents ----------

function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-soft)] sm:p-4">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        {right && <div className="ml-auto">{right}</div>}
      </div>
      {children}
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="h-9 w-9"
    >
      {children}
    </Button>
  );
}

function ModeBadge({ mode }: { mode: Mode }) {
  const sim = mode === "simulated";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
      style={{
        backgroundColor: sim ? "var(--mode-sim-bg)" : "var(--mode-live-bg)",
        color: sim ? "var(--mode-sim)" : "var(--mode-live)",
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: sim ? "var(--mode-sim)" : "var(--mode-live)" }}
      />
      {sim ? "Simulated" : "Live LLM"}
    </span>
  );
}

function ModeButton({
  active,
  onClick,
  tone,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  tone: "sim" | "live";
  label: string;
  hint: string;
}) {
  const color = tone === "sim" ? "var(--mode-sim)" : "var(--mode-live)";
  const bg = tone === "sim" ? "var(--mode-sim-bg)" : "var(--mode-live-bg)";
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 rounded-md border px-2.5 py-2 text-left text-xs transition-colors",
        active ? "border-transparent" : "border-border bg-background hover:bg-accent",
      )}
      style={active ? { backgroundColor: bg, color } : undefined}
    >
      <div className="font-medium">{label}</div>
      <div className="opacity-70">{hint}</div>
    </button>
  );
}

function ExtractTable({ rows }: { rows: Record<string, string> }) {
  const entries = Object.entries(rows);
  if (entries.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Nothing extracted yet. Watch this fill as the agent works.
      </p>
    );
  }
  return (
    <div className="overflow-hidden rounded-md border border-border text-xs">
      {entries.map(([k, v], i) => (
        <div
          key={k}
          className={cn(
            "grid grid-cols-[1fr_1.5fr] gap-2 px-2.5 py-1.5",
            i > 0 && "border-t border-border",
          )}
        >
          <span className="text-muted-foreground">{k}</span>
          <span className="truncate font-medium">{v}</span>
        </div>
      ))}
    </div>
  );
}

function collectExtracts(steps: { extracted?: Record<string, string> }[]) {
  const out: Record<string, string> = {};
  for (const s of steps) {
    if (s.extracted) Object.assign(out, s.extracted);
  }
  return out;
}

function CompareRuns({ a, b }: { a?: RunRecord; b?: RunRecord }) {
  if (!a || !b) {
    return (
      <p className="text-sm text-muted-foreground">Need at least two completed runs to compare.</p>
    );
  }
  const keys = Array.from(new Set([...Object.keys(a.extracted), ...Object.keys(b.extracted)]));
  return (
    <div className="grid grid-cols-2 gap-3">
      {[a, b].map((r, i) => (
        <div key={r.id} className="rounded-md border border-border p-3 text-xs">
          <div className="mb-2 text-muted-foreground">Run {i === 0 ? "A (latest)" : "B"}</div>
          <div className="space-y-1">
            <Row k="Mode" v={r.mode} />
            <Row k="Duration" v={`${(r.durationMs / 1000).toFixed(1)}s`} />
            <Row k="Steps" v={String(r.stepCount)} />
            <Row k="Result" v={r.passed ? "pass" : "fail"} />
          </div>
          <div className="mt-3 border-t border-border pt-2">
            <div className="mb-1 text-muted-foreground">Extracted</div>
            {keys.map((k) => {
              const same = a.extracted[k] === b.extracted[k];
              return (
                <div
                  key={k}
                  className={cn(
                    "grid grid-cols-[1fr_1.5fr] gap-2 py-0.5",
                    !same && "text-foreground",
                  )}
                >
                  <span className="text-muted-foreground">{k}</span>
                  <span className={cn("font-medium", !same && "text-primary")}>
                    {r.extracted[k] ?? "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[1fr_1.5fr] gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}