import { cn } from "@/lib/utils";
import type { StepKind } from "@/lib/types";

const STYLES: Record<StepKind, { bg: string; fg: string; label: string }> = {
  goal: { bg: "var(--step-goal-bg)", fg: "var(--step-goal)", label: "goal" },
  plan: { bg: "var(--step-plan-bg)", fg: "var(--step-plan)", label: "plan" },
  click: { bg: "var(--step-click-bg)", fg: "var(--step-click)", label: "click" },
  type: { bg: "var(--step-type-bg)", fg: "var(--step-type)", label: "type" },
  observe: { bg: "var(--step-observe-bg)", fg: "var(--step-observe)", label: "observe" },
  extract: { bg: "var(--step-extract-bg)", fg: "var(--step-extract)", label: "extract" },
  verify: { bg: "var(--step-verify-bg)", fg: "var(--step-verify)", label: "verify" },
};

export function StepChip({
  kind,
  className,
}: {
  kind: StepKind;
  className?: string;
}) {
  const s = STYLES[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        className,
      )}
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}

export function StepLegend() {
  const kinds: StepKind[] = ["goal", "plan", "click", "type", "observe", "extract", "verify"];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {kinds.map((k) => (
        <StepChip key={k} kind={k} />
      ))}
    </div>
  );
}