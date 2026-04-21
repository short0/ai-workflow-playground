import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Target,
  ListTree,
  MousePointerClick,
  Eye,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { PRESETS } from "@/lib/presets";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Computer Use Playground — See how AI agents read and click" },
      {
        name: "description",
        content:
          "A safe, mocked sandbox to learn how computer-use AI agents plan tasks, click UIs, observe results, and verify outcomes.",
      },
      { property: "og:title", content: "Computer Use Playground" },
      {
        property: "og:description",
        content:
          "Watch an AI agent plan, act, observe, and verify a task on mocked screens.",
      },
    ],
  }),
  component: Index,
});

const STEPS = [
  { icon: Target, title: "Goal", desc: "What outcome the user wants." },
  { icon: ListTree, title: "Plan", desc: "Break the goal into ordered steps." },
  { icon: MousePointerClick, title: "Act", desc: "Click, type, navigate the UI." },
  { icon: Eye, title: "Observe", desc: "Read the new screen state." },
  { icon: ShieldCheck, title: "Verify", desc: "Confirm the outcome is correct." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pb-12 pt-12 sm:px-6 sm:pt-20 lg:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            Educational sandbox · fully mocked by default
          </span>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            See how an AI agent reads screens and clicks like a person.
          </h1>
          <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">
            Computer Use Playground walks you through the loop every computer-use agent runs:
            <strong className="mx-1 text-foreground">goal → plan → act → observe → verify</strong>
            — with safe, mocked screens you can step through and replay.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <Button asChild size="lg" className="gap-2">
              <Link to="/playground">
                Launch a preset <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/playground">Open blank playground</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-7">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            How it works
          </h2>
          <ol className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="flex items-start gap-3 rounded-xl border border-border bg-background p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <s.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Step {i + 1}</div>
                  <div className="font-medium">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Presets */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Presets</h2>
            <p className="text-sm text-muted-foreground">
              Launch a fully scripted run, then tweak the goal or replay it.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {PRESETS.map((p) => (
            <article
              key={p.id}
              className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-colors hover:border-ring/40"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold">{p.title}</h3>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  ~{p.estSteps} steps
                </span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{p.purpose}</p>
              <div className="mt-4">
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link to="/playground" search={{ preset: p.id }}>
                    Launch <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Why this exists
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3 sm:gap-6">
            <li>
              <div className="font-medium">For developers</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Inspect how plans, actions, and observations connect — without spinning up a real
                browser-automation stack.
              </p>
            </li>
            <li>
              <div className="font-medium">For AI builders</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Compare runs, study verification logic, and test goal phrasings side-by-side.
              </p>
            </li>
            <li>
              <div className="font-medium">For learners</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Plain-language step explanations, color-coded action types, and replay make the
                loop concrete.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Computer Use Playground — fully mocked, no real systems touched.
      </footer>
    </div>
  );
}
