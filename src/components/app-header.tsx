import { Link } from "@tanstack/react-router";
import { Moon, Sun, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

interface Props {
  onReset?: () => void;
}

export function AppHeader({ onReset }: Props) {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">Computer Use Playground</span>
          <span className="sm:hidden">CUP</span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 sm:flex">
          <Link
            to="/"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            activeProps={{ className: "rounded-md px-3 py-1.5 text-sm bg-accent text-accent-foreground" }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>
          <Link
            to="/playground"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            activeProps={{ className: "rounded-md px-3 py-1.5 text-sm bg-accent text-accent-foreground" }}
          >
            Playground
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="hidden gap-1.5 sm:inline-flex"
              aria-label="Reset session"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}