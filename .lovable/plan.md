
# Computer Use Playground — Build Plan

A polished, educational sandbox that teaches the **goal → plan → act → observe → verify** loop of computer-use AI agents, using fully mocked runs by default.

## Information Architecture

- `/` — **Home**: hero, "How it works" strip, preset gallery, CTAs.
- `/playground` — **Playground**: 3-panel workspace (preset/goal, mock screen + timeline, observations + verification).
- `/playground?preset=<id>` — deep link to launch a specific preset.
- Shared header with logo, nav (Home, Playground), theme toggle, and a "Reset" button.

## Home Screen

- **Hero**: short, plain-language explanation of computer use ("AI that reads screens and clicks like a person — here's how it thinks"), primary CTA "Launch a preset", secondary "Open blank playground".
- **How it works**: 5 labeled steps in a horizontal strip — Goal, Plan, Act, Observe, Verify — each with a one-line description and a small icon.
- **Preset gallery**: 4 cards (see below), each with title, one-sentence purpose, est. steps, and "Launch" button.
- **Why this exists**: small section with 3 bullets aimed at developers, builders, and learners.

## Playground Screen (3-panel desktop, stacked mobile)

**Left panel — Setup**
- Preset selector (dropdown + "Browse all").
- Goal input (textarea, prefilled by preset, editable).
- Mode toggle: **Simulated** (default, badge: green) vs **Live LLM** (badge: amber "Advanced").
- Quick prompts (3–5 clickable chips per preset).
- Settings: playback speed, auto-advance toggle, show reasoning toggle.
- Notes field (persisted).

**Center panel — Run stage**
- **Mock screen**: a stylized browser/app frame that visually changes per step (form fields filling, modals opening, ticket submitted, etc.) — built with simple CSS/SVG mocks, not real iframes.
- **Action timeline**: vertical list of steps with type-tagged labels (`plan`, `click`, `type`, `observe`, `extract`, `verify`). Active step highlighted; click any step to jump.
- **Step controls**: Prev / Play-Pause / Next / Replay / **Undo** / **Redo** / **Reset**.
- Each step shows what UI action caused the screen change, with an "Explain this step" expandable note in plain language.

**Right panel — Insight**
- Current observation (what the agent "sees").
- Extracted results (key/value table — e.g. invoice fields).
- Reasoning summary (short rationale for the current step).
- Verification status at the end: pass/fail checklist with reasons.
- "Compare runs" button — shows a side-by-side diff of the last two completed runs (timing, outcome, extracted values).

## Presets (preloaded, fully mocked)

1. **Fill a mock expense form** — goal, 6–8 steps (open form → type fields → upload receipt → submit → verify confirmation).
2. **Extract invoice details from a fake portal** — login mock → navigate → read invoice → extract { invoice #, date, total, vendor } → verify schema.
3. **File a helpdesk support ticket** — open helpdesk → search KB → start new ticket → fill category/priority/description → submit → verify ticket ID returned.
4. **Run a QA flow on a sample web app** — open app → run 3 checks (login works, search returns results, checkout total correct) → verify pass/fail report.

Each preset ships with: goal, plan, mocked screen states per step, action labels, observations, extracted results, reasoning notes, final verification, and 3–5 quick prompts.

## Learning Features

- Inline color-coded labels for `goal / plan / click / type / observe / extract / verify`.
- "What just happened?" tooltip on every screen change linking action → observation.
- "Explain this step" toggle showing a beginner-friendly paragraph.
- Replay button + run history (last 5 runs) with compare view.
- Subtle legend in the header explaining the label colors.

## Optional Live Mode (clearly secondary)

- Toggle in left panel; shows a clear amber banner across the run stage when active: "Live mode — outputs come from a real model".
- Uses Lovable AI Gateway for plan + reasoning generation; screen mocks remain the same so behavior stays safe and deterministic visually.
- If user enables it, we ask once for confirmation and remember the choice.
- Default everywhere remains Simulated.

## State & Persistence (localStorage)

Persisted keys: `theme`, `mode`, `selectedPreset`, `goalDraft`, `notes`, `recentGoals` (last 10), `runHistory` (last 5 per preset), `settings` (speed, auto-advance, show reasoning), `currentSession` (step index, panel state).

**Undo / Redo** stack covers: preset change, goal edit, mode change, settings change, replay start, session clear. Keyboard: ⌘/Ctrl+Z, ⌘/Ctrl+Shift+Z.

**Reset to Home** clears the active session and returns to `/` but preserves theme, presets, and history.

## Design System

- Light mode default; dark mode via toggle (persisted).
- Neutral palette (warm-tinted off-white bg in light, slate near-black in dark), single restrained accent for active/CTAs.
- Generous spacing, 1px borders, soft shadows only on elevated cards, rounded-lg corners.
- Typography: clean sans (Inter via system stack fallback), clear hierarchy, no decorative fonts.
- Step-type label colors: muted, distinct, accessible in both themes.

## Responsiveness

- **Desktop ≥1024px**: 3-panel layout, left 280px, right 340px, center fluid.
- **Tablet 640–1023px**: left collapses into a top bar with preset + goal; center + right stacked or tabbed.
- **Mobile <640px**: vertical stack (Setup → Stage → Insight) with a sticky top bar holding Mode badge, Play/Pause, Undo/Redo, Reset.

## Accessibility

- Full keyboard navigation, visible focus rings, semantic landmarks, ARIA labels on icon buttons.
- 44px+ tap targets on mobile.
- Contrast verified in both themes.

## Out of Scope

- No auth, no backend persistence, no real browser automation — everything visual is a styled mock.
- Live LLM is optional and isolated; not required for any core flow.

<lov-actions>
<lov-suggestion message="Looks good — implement this plan.">Implement plan</lov-suggestion>
<lov-suggestion message="Add 2 more presets: a calendar booking flow and a data-entry CRM update flow, with the same mocked structure.">Add 2 more presets</lov-suggestion>
<lov-suggestion message="Add an export button that downloads the current run (steps, observations, extracted data, verification) as a JSON file.">Add run export (JSON)</lov-suggestion>
<lov-suggestion message="Skip the optional Live LLM mode entirely and keep the app fully simulated for a simpler, more focused build.">Drop Live LLM mode</lov-suggestion>
</lov-actions>
