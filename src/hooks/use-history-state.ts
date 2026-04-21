import * as React from "react";

/**
 * useHistoryState — value with undo/redo stacks.
 * `set` pushes a snapshot. `replace` updates without pushing (for transient typing).
 */
export function useHistoryState<T>(initial: T, limit = 50) {
  const [present, setPresent] = React.useState<T>(initial);
  const pastRef = React.useRef<T[]>([]);
  const futureRef = React.useRef<T[]>([]);
  const [, force] = React.useReducer((x: number) => x + 1, 0);

  const set = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      setPresent((prev) => {
        const value = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        if (Object.is(value, prev)) return prev;
        pastRef.current.push(prev);
        if (pastRef.current.length > limit) pastRef.current.shift();
        futureRef.current = [];
        force();
        return value;
      });
    },
    [limit],
  );

  const replace = React.useCallback((next: T | ((prev: T) => T)) => {
    setPresent((prev) =>
      typeof next === "function" ? (next as (p: T) => T)(prev) : next,
    );
  }, []);

  const undo = React.useCallback(() => {
    setPresent((prev) => {
      const past = pastRef.current;
      if (past.length === 0) return prev;
      const previous = past[past.length - 1];
      pastRef.current = past.slice(0, -1);
      futureRef.current = [prev, ...futureRef.current];
      force();
      return previous;
    });
  }, []);

  const redo = React.useCallback(() => {
    setPresent((prev) => {
      const future = futureRef.current;
      if (future.length === 0) return prev;
      const next = future[0];
      futureRef.current = future.slice(1);
      pastRef.current = [...pastRef.current, prev];
      force();
      return next;
    });
  }, []);

  const reset = React.useCallback((value: T) => {
    pastRef.current = [];
    futureRef.current = [];
    setPresent(value);
    force();
  }, []);

  return {
    value: present,
    set,
    replace,
    undo,
    redo,
    reset,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
  };
}