import { cn } from "@/lib/utils";

/**
 * MockScreen renders a stylized browser frame whose body changes based on
 * the current screen id. Each preset has its own set of screen ids.
 */
export function MockScreen({ screen }: { screen: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="ml-2 flex-1 truncate rounded-md bg-background/70 px-2 py-1 text-[11px] text-muted-foreground">
          https://app.example.com/{screen.replace(/-/g, "/")}
        </div>
      </div>
      {/* Screen body */}
      <div className="min-h-[260px] bg-background p-4 text-sm sm:min-h-[320px] sm:p-6">
        <ScreenBody screen={screen} />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  active,
}: {
  label: string;
  value?: string;
  active?: boolean;
}) {
  return (
    <div>
      <div className="mb-1 text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "h-9 rounded-md border bg-background px-2.5 text-sm leading-9",
          active ? "border-ring ring-2 ring-ring/30" : "border-input",
          !value && "text-muted-foreground/60",
        )}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function Btn({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "h-8 rounded-md border px-3 text-xs font-medium transition-colors",
        primary
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background hover:bg-accent",
      )}
    >
      {label}
    </button>
  );
}

function Banner({ tone, children }: { tone: "success" | "info"; children: React.ReactNode }) {
  return (
    <div
      className="rounded-md border px-3 py-2 text-xs"
      style={{
        backgroundColor: tone === "success" ? "var(--mode-sim-bg)" : "var(--step-plan-bg)",
        color: tone === "success" ? "var(--mode-sim)" : "var(--step-plan)",
        borderColor: "transparent",
      }}
    >
      {children}
    </div>
  );
}

function ScreenBody({ screen }: { screen: string }) {
  // EXPENSE FORM
  if (screen.startsWith("expense")) {
    const filled = screen !== "expense-empty";
    const partial = screen === "expense-partial";
    const hasDate = ["expense-filled", "expense-receipt", "expense-submitted"].includes(screen);
    const hasReceipt = ["expense-receipt", "expense-submitted"].includes(screen);
    const submitted = screen === "expense-submitted";
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">New expense</h3>
          {!filled && <Btn label="+ New Expense" primary />}
        </div>
        {submitted ? (
          <div className="space-y-3">
            <Banner tone="success">✓ Submitted — reference EXP-7741</Banner>
            <div className="rounded-md border border-border bg-muted/30 p-3 text-xs">
              Bistro Lumière · $48.20 · 2024-03-12 · Meals & Entertainment · receipt attached
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Merchant" value={filled ? "Bistro Lumière" : ""} active={partial} />
            <Field label="Amount (USD)" value={filled ? "48.20" : ""} active={partial} />
            <Field label="Date" value={hasDate ? "2024-03-12" : ""} active={screen === "expense-filled"} />
            <Field label="Category" value={hasDate ? "Meals & Entertainment" : ""} />
            <div className="sm:col-span-2">
              <div className="mb-1 text-xs text-muted-foreground">Receipt</div>
              <div
                className={cn(
                  "flex h-16 items-center justify-center rounded-md border border-dashed text-xs",
                  hasReceipt ? "border-ring text-foreground" : "border-input text-muted-foreground",
                )}
              >
                {hasReceipt ? "📎 receipt-2024-03-12.pdf (124 KB)" : "Drag a file or click to upload"}
              </div>
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Btn label="Cancel" />
              <Btn label="Submit" primary />
            </div>
          </div>
        )}
      </div>
    );
  }

  // INVOICE PORTAL
  if (screen.startsWith("portal")) {
    if (screen === "portal-login") {
      return (
        <div className="mx-auto max-w-xs space-y-3 py-4">
          <h3 className="text-base font-semibold">Sign in</h3>
          <Field label="Email" value="agent@demo.io" active />
          <Field label="Password" value="••••••••" />
          <Btn label="Log in" primary />
        </div>
      );
    }
    if (screen === "portal-dashboard") {
      return (
        <div className="space-y-3">
          <Banner tone="info">Welcome back, Agent</Banner>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-md border border-border p-2"><div className="text-muted-foreground">Open</div><div className="text-base font-semibold">12</div></div>
            <div className="rounded-md border border-border p-2"><div className="text-muted-foreground">Paid</div><div className="text-base font-semibold">48</div></div>
            <div className="rounded-md border border-border p-2"><div className="text-muted-foreground">Total</div><div className="text-base font-semibold">$84,210</div></div>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="rounded bg-muted px-2 py-1">Home</span>
            <span className="rounded bg-accent px-2 py-1 text-accent-foreground">Invoices</span>
            <span className="rounded bg-muted px-2 py-1">Settings</span>
          </div>
        </div>
      );
    }
    if (screen === "portal-invoices") {
      const rows = [
        { id: "INV-2041", vendor: "Northwind Cloud", total: "$2,480.00", date: "2024-03-18", active: true },
        { id: "INV-2040", vendor: "Acme Print", total: "$420.00", date: "2024-03-15" },
        { id: "INV-2039", vendor: "Globex AV", total: "$1,120.00", date: "2024-03-12" },
      ];
      return (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Invoices</h3>
          <div className="overflow-hidden rounded-md border border-border text-xs">
            <div className="grid grid-cols-4 bg-muted/40 px-3 py-2 font-medium text-muted-foreground">
              <div>ID</div><div>Vendor</div><div>Date</div><div className="text-right">Total</div>
            </div>
            {rows.map((r) => (
              <div
                key={r.id}
                className={cn(
                  "grid grid-cols-4 border-t border-border px-3 py-2",
                  r.active && "bg-accent/60",
                )}
              >
                <div className="font-medium">{r.id}</div>
                <div>{r.vendor}</div>
                <div className="text-muted-foreground">{r.date}</div>
                <div className="text-right">{r.total}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    // portal-invoice-detail
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">INV-2041</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Open</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><div className="text-muted-foreground">Vendor</div><div className="font-medium">Northwind Cloud</div></div>
          <div><div className="text-muted-foreground">Date</div><div className="font-medium">2024-03-18</div></div>
          <div><div className="text-muted-foreground">Total</div><div className="font-medium">$2,480.00</div></div>
          <div><div className="text-muted-foreground">Due</div><div className="font-medium">2024-04-01</div></div>
        </div>
        <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          5 line items · subtotal $2,300.00 · tax $180.00
        </div>
      </div>
    );
  }

  // HELPDESK
  if (screen.startsWith("helpdesk")) {
    if (screen === "helpdesk-home") {
      return (
        <div className="space-y-3">
          <h3 className="text-base font-semibold">Helpdesk</h3>
          <Field label="Search the knowledge base" value="" />
          <div className="text-xs text-muted-foreground">Or browse: Network · Email · Hardware · Access</div>
        </div>
      );
    }
    if (screen === "helpdesk-search") {
      return (
        <div className="space-y-3">
          <Field label="Search the knowledge base" value="VPN macOS" active />
          <div className="space-y-1.5 text-xs">
            {["Resetting VPN profile (Big Sur)", "Common VPN errors", "Corporate VPN setup guide"].map((t) => (
              <div key={t} className="rounded-md border border-border px-2.5 py-1.5">{t}</div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">No article matches macOS Sonoma.</div>
          <Btn label="+ New ticket" primary />
        </div>
      );
    }
    const filled = ["helpdesk-filled", "helpdesk-submitted"].includes(screen);
    if (screen === "helpdesk-submitted") {
      return (
        <div className="space-y-3">
          <Banner tone="success">✓ Ticket TKT-30219 created — High priority</Banner>
          <div className="rounded-md border border-border bg-muted/30 p-3 text-xs">
            Network · macOS Sonoma 14.4 · VPN disconnects every ~3 minutes after sleep.
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">New ticket</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category" value="Network" />
          <Field label="Priority" value="High" />
        </div>
        <div>
          <div className="mb-1 text-xs text-muted-foreground">Description</div>
          <div className={cn(
            "min-h-20 rounded-md border bg-background p-2 text-xs",
            filled ? "border-input" : "border-input text-muted-foreground/60",
          )}>
            {filled
              ? "macOS Sonoma 14.4 — corporate VPN disconnects every ~3 minutes after the laptop wakes from sleep. Reconnect works but session is lost. Started after the 14.4 update."
              : "Describe the issue…"}
          </div>
        </div>
        <Btn label="Submit ticket" primary />
      </div>
    );
  }

  // QA FLOW
  if (screen.startsWith("qa")) {
    if (screen === "qa-home" || screen === "qa-login") {
      const active = screen === "qa-login";
      return (
        <div className="mx-auto max-w-xs space-y-3 py-4">
          <h3 className="text-base font-semibold">Sample shop — sign in</h3>
          <Field label="Email" value={active ? "qa@test.io" : ""} active={active} />
          <Field label="Password" value={active ? "••••••••" : ""} />
          <Btn label="Sign in" primary />
        </div>
      );
    }
    if (screen === "qa-dashboard") {
      return (
        <div className="space-y-3">
          <Banner tone="success">Welcome, QA</Banner>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-md border border-border p-2"><div className="text-muted-foreground">Orders</div><div className="font-semibold">3</div></div>
            <div className="rounded-md border border-border p-2"><div className="text-muted-foreground">Wishlist</div><div className="font-semibold">7</div></div>
            <div className="rounded-md border border-border p-2"><div className="text-muted-foreground">Credits</div><div className="font-semibold">$12</div></div>
          </div>
        </div>
      );
    }
    if (screen === "qa-search") {
      return (
        <div className="space-y-3">
          <Field label="Search products" value="lamp" active />
          <div className="grid grid-cols-3 gap-2 text-xs">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-md border border-border p-2">
                <div className="mb-1 h-12 rounded bg-muted" />
                <div className="font-medium">Lamp #{i + 1}</div>
                <div className="text-muted-foreground">${(19 + i * 4).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">12 results</div>
        </div>
      );
    }
    if (screen === "qa-checkout") {
      return (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Checkout</h3>
          <div className="rounded-md border border-border p-3 text-xs">
            <div className="flex justify-between"><span>Lamp #1 × 2</span><span>$58.00</span></div>
            <div className="mt-1 flex justify-between text-muted-foreground"><span>Tax (8%)</span><span>$4.64</span></div>
            <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold"><span>Total</span><span>$62.64</span></div>
          </div>
          <Btn label="Pay $62.64" primary />
        </div>
      );
    }
    // qa-report
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">QA Report</h3>
        <div className="space-y-1.5 text-xs">
          {[
            ["Login works", true],
            ["Search returns results", true],
            ["Checkout total correct", true],
          ].map(([label, pass]) => (
            <div key={label as string} className="flex items-center justify-between rounded-md border border-border px-3 py-1.5">
              <span>{label as string}</span>
              <span style={{ color: "var(--mode-sim)" }}>{pass ? "✓ pass" : "× fail"}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Mock screen
    </div>
  );
}