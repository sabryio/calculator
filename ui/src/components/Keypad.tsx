// Keypad: memory strip + main grid, laid out to match Windows Calculator standard mode.
// All interactive behavior flows through engine commands — no local arithmetic in the UI.
import { useEffect, type ReactNode } from "react";

import { CommandId, type CommandId as Command } from "../engine/types";
import type { EngineState } from "../engine/types";

export interface KeyDef {
  id: Command;
  label: string;
  aria: string;
  /** "accent" (blue, `=` only); "op" = operator tier (Alt fill, smaller); "ctrl" = CE/C/⌫ row size. */
  tier?: "accent" | "op" | "ctrl";
  /** Keyboard keys that trigger this command. */
  keys?: string[];
  /** Ctrl-combos (Windows calc conventions: Ctrl+P=M+, Ctrl+Q=M−, Ctrl+R=MR, Ctrl+M=MS, Ctrl+L=MC). */
  ctrls?: string[];
}

export const MEM_KEYS: KeyDef[] = [
  { id: CommandId.MemoryClear, label: "MC", aria: "memory clear", ctrls: ["l"] },
  { id: CommandId.MemoryRecall, label: "MR", aria: "memory recall", ctrls: ["r"] },
  { id: CommandId.MemoryAdd, label: "M+", aria: "add to memory", ctrls: ["p"] },
  { id: CommandId.MemorySubtract, label: "M−", aria: "subtract from memory", ctrls: ["q"] },
  { id: CommandId.MemoryStore, label: "MS", aria: "store in memory", ctrls: ["m"] },
];

export const KEYS: KeyDef[] = [
  { id: CommandId.Percent, label: "%", aria: "percent", tier: "op", keys: ["%"] },
  { id: CommandId.ClearEntry, label: "CE", aria: "clear entry", tier: "ctrl", keys: ["Delete"] },
  { id: CommandId.ClearAll, label: "C", aria: "clear all", tier: "ctrl", keys: ["Escape"] },
  { id: CommandId.Backspace, label: "⌫", aria: "backspace", tier: "ctrl", keys: ["Backspace"] },

  { id: CommandId.Inverse, label: "¹⁄ₓ", aria: "reciprocal of displayed value", tier: "op" },
  { id: CommandId.Square, label: "x²", aria: "square of displayed value", tier: "op" },
  { id: CommandId.Sqrt, label: "²√x", aria: "square root of displayed value", tier: "op" },
  { id: CommandId.Divide, label: "÷", aria: "divide", tier: "op", keys: ["/"] },

  { id: CommandId.Digit7, label: "7", aria: "seven", keys: ["7"] },
  { id: CommandId.Digit8, label: "8", aria: "eight", keys: ["8"] },
  { id: CommandId.Digit9, label: "9", aria: "nine", keys: ["9"] },
  { id: CommandId.Multiply, label: "×", aria: "multiply", tier: "op", keys: ["*"] },

  { id: CommandId.Digit4, label: "4", aria: "four", keys: ["4"] },
  { id: CommandId.Digit5, label: "5", aria: "five", keys: ["5"] },
  { id: CommandId.Digit6, label: "6", aria: "six", keys: ["6"] },
  { id: CommandId.Subtract, label: "−", aria: "subtract", tier: "op", keys: ["-"] },

  { id: CommandId.Digit1, label: "1", aria: "one", keys: ["1"] },
  { id: CommandId.Digit2, label: "2", aria: "two", keys: ["2"] },
  { id: CommandId.Digit3, label: "3", aria: "three", keys: ["3"] },
  { id: CommandId.Add, label: "+", aria: "add", tier: "op", keys: ["+"] },

  { id: CommandId.Negate, label: "+/−", aria: "toggle sign", tier: "op" },
  { id: CommandId.Digit0, label: "0", aria: "zero", keys: ["0"] },
  { id: CommandId.Decimal, label: ".", aria: "decimal point", keys: [".", ","] },
  { id: CommandId.Equals, label: "=", aria: "equals", tier: "accent", keys: ["Enter", "="] },
];

/** Which memory keys are live, given the engine state (Windows dims MC/MR/M▾ with empty memory). */
export function memEnabled(id: Command, state: EngineState): boolean {
  switch (id) {
    case CommandId.MemoryClear:
    case CommandId.MemoryRecall:
      return state.memory !== undefined && !state.isError;
    case CommandId.MemoryAdd:
    case CommandId.MemorySubtract:
    case CommandId.MemoryStore:
      return !state.isError;
    default:
      return true;
  }
}

function MemoryStrip({ state, onCommand }: { state: EngineState; onCommand: (id: Command) => void }) {
  return (
    <div className="calc__memstrip" role="group" aria-label="Memory keys">
      {MEM_KEYS.map((def) => {
        const enabled = memEnabled(def.id, state);
        return (
          <button
            key={def.id}
            type="button"
            className="memkey"
            aria-label={def.aria}
            disabled={!enabled}
            onClick={() => onCommand(def.id)}
          >
            {def.label}
          </button>
        );
      })}
      <button
        type="button"
        className="memkey"
        aria-label="Memory list"
        disabled
        title="Coming soon"
      >
        M
        <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true" style={{ marginLeft: 2 }}>
          <path d="M1 5.2 4 2.4 7 5.2" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

/** Class for a key: tier → XAML style (accent = AccentEmphasizedCalcButtonStyle,
 * op = CalcButtonAltFillColor* tier, default = CalcButtonFillColor* digit tier). */
function keyClass(tier?: string): string {
  switch (tier) {
    case "accent":
      return "key key--accent";
    case "op":
      return "key key--op";
    case "ctrl":
      return "key key--ctrl";
    default:
      return "key";
  }
}

function Key({ def, onCommand }: { def: KeyDef; onCommand: (id: Command) => void }) {
  return (
    <button
      type="button"
      className={keyClass(def.tier)}
      aria-label={def.aria}
      onClick={() => onCommand(def.id)}
    >
      {def.label}
    </button>
  );
}

/**
 * Keyboard support: plain keys map to commands; memory keys use the Windows calc
 * Ctrl-combos. Mounted once; nothing here re-renders on state change.
 */
function useKeyboard(onCommand: (id: Command) => void): ReactNode {
  useEffect(() => {
    const keyToCommand = new Map<string, Command>();
    const ctrlToCommand = new Map<string, Command>();
    for (const def of [...KEYS, ...MEM_KEYS]) {
      if (def.keys) for (const k of def.keys) keyToCommand.set(k, def.id);
      if (def.ctrls) for (const k of def.ctrls) ctrlToCommand.set(k, def.id);
    }
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        const cmd = ctrlToCommand.get(e.key.toLowerCase());
        if (cmd) {
          e.preventDefault();
          onCommand(cmd);
        }
        return;
      }
      if (e.altKey || e.metaKey) return;
      const cmd = keyToCommand.get(e.key);
      if (cmd) {
        e.preventDefault();
        onCommand(cmd);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCommand]);
  return null;
}

export function Keypad({
  state,
  onCommand,
}: {
  state: EngineState;
  onCommand: (id: Command) => void;
}) {
  useKeyboard(onCommand);
  return (
    <>
      <MemoryStrip state={state} onCommand={onCommand} />
      <div className="calc__pad" role="group" aria-label="Standard keypad">
        {KEYS.map((def) => (
          <Key key={def.id} def={def} onCommand={onCommand} />
        ))}
      </div>
    </>
  );
}
