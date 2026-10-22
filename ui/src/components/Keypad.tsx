// Keypad: command list + keyboard wiring. All interactive behavior flows through engine
// commands — no local arithmetic state lives in the UI.
import { useEffect, type ReactNode } from "react";

import { CommandId, type CommandId as Command } from "../engine/types";

export interface KeyDef {
  id: Command;
  label: string;
  aria: string;
  tier: "digit" | "secondary" | "primary" | "accent";
  /** Keyboard key(s) that trigger this command; the first is the canonical one. */
  keys?: string[];
}

export const KEYS: KeyDef[] = [
  // row 1 — unary / clear block
  { id: CommandId.Inverse, label: "1/x", aria: "reciprocal of displayed value", tier: "secondary" },
  { id: CommandId.Square, label: "x²", aria: "square of displayed value", tier: "secondary" },
  { id: CommandId.Sqrt, label: "√x", aria: "square root of displayed value", tier: "secondary" },
  { id: CommandId.Divide, label: "÷", aria: "divide", tier: "secondary", keys: ["/"] },

  // row 2 — clear block + digits 7-9
  { id: CommandId.ClearEntry, label: "CE", aria: "clear entry", tier: "secondary", keys: ["Delete"] },
  { id: CommandId.ClearAll, label: "C", aria: "clear all", tier: "secondary", keys: ["Escape"] },
  { id: CommandId.Backspace, label: "⌫", aria: "backspace", tier: "secondary", keys: ["Backspace"] },
  { id: CommandId.Multiply, label: "×", aria: "multiply", tier: "secondary", keys: ["*"] },

  // row 3
  { id: CommandId.Digit7, label: "7", aria: "seven", tier: "digit", keys: ["7"] },
  { id: CommandId.Digit8, label: "8", aria: "eight", tier: "digit", keys: ["8"] },
  { id: CommandId.Digit9, label: "9", aria: "nine", tier: "digit", keys: ["9"] },
  { id: CommandId.Subtract, label: "−", aria: "subtract", tier: "secondary", keys: ["-"] },

  // row 4
  { id: CommandId.Digit4, label: "4", aria: "four", tier: "digit", keys: ["4"] },
  { id: CommandId.Digit5, label: "5", aria: "five", tier: "digit", keys: ["5"] },
  { id: CommandId.Digit6, label: "6", aria: "six", tier: "digit", keys: ["6"] },
  { id: CommandId.Add, label: "+", aria: "add", tier: "secondary", keys: ["+"] },

  // row 5
  { id: CommandId.Digit1, label: "1", aria: "one", tier: "digit", keys: ["1"] },
  { id: CommandId.Digit2, label: "2", aria: "two", tier: "digit", keys: ["2"] },
  { id: CommandId.Digit3, label: "3", aria: "three", tier: "digit", keys: ["3"] },
  { id: CommandId.Equals, label: "=", aria: "equals", tier: "accent", keys: ["Enter", "="] },

  // row 6
  { id: CommandId.Negate, label: "+/−", aria: "toggle sign", tier: "primary" },
  { id: CommandId.Digit0, label: "0", aria: "zero", tier: "digit", keys: ["0"] },
  { id: CommandId.Decimal, label: ".", aria: "decimal point", tier: "digit", keys: ["."] },
  { id: CommandId.Percent, label: "%", aria: "percent", tier: "primary", keys: ["%"] },
];

function Key({
  def,
  onCommand,
}: {
  def: KeyDef;
  onCommand: (id: Command) => void;
}) {
  const cls =
    def.tier === "accent"
      ? "key key--accent"
      : def.tier === "digit"
        ? "key key--digit"
        : def.tier === "secondary"
          ? "key key--secondary"
          : "key";
  return (
    <button className={cls} aria-label={def.aria} onClick={() => onCommand(def.id)} type="button">
      {def.label}
    </button>
  );
}

/**
 * Keyboard support: maps physical keys to engine commands, ignoring IME composition.
 * Mounted once; nothing here re-renders on state change.
 */
function useKeyboard(onCommand: (id: Command) => void): ReactNode {
  useEffect(() => {
    const keyToCommand = new Map<string, Command>();
    for (const { keys, id } of KEYS) {
      if (!keys) continue;
      for (const k of keys) keyToCommand.set(k, id);
    }
    const handler = (e: KeyboardEvent) => {
      if (e.repeat && !keyToCommand.has(e.key)) return;
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

export function Keypad({ onCommand }: { onCommand: (id: Command) => void }) {
  useKeyboard(onCommand);
  return (
    <div className="calc__pad" role="group" aria-label="Standard keypad">
      {KEYS.map((def) => (
        <Key key={def.id} def={def} onCommand={onCommand} />
      ))}
    </div>
  );
}
