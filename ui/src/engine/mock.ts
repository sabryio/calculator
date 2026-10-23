// Mock engine: synchronous, pure, approximate.
//
// SEMANTICS NOTES (evidence for the future Rust engine port — keep in sync with
// migration/PORTING.md when it is written):
// - Percent: Windows standard mode — pending `+`/`-` means `y%` = `accum × y / 100`;
//   pending `×`/`÷` means `y / 100`; no pending op means `y / 100`.
// - Divide by zero → hard error "Cannot divide by zero"; sqrt(negative) → "Invalid input";
//   1/0 → "Error: 1/0". Hard errors block input until ClearAll (digit recovers).
// - Repeating `=` after a result repeats the last binary operation with the same right
//   operand (CEngine behavior).
// - Display formatting: plain short decimal string via JS `String(number)` (full double
//   precision, no rounding). Grouping/precision will be replaced by the Rust engine's
//   radix formatting (CEngine scidisp) once the port lands — mock keeps raw precision so
//   downstream precision drift is never hidden by mock-side rounding.
import {
  CommandId,
  type BinaryOp,
  type CommandId as Command,
  type EngineApi,
  type EngineState,
} from "./types";

const initial: EngineState = {
  display: "0",
  expression: "",
  isError: false,
  awaitingEntry: true,
};

function fmt(n: number): string {
  if (!Number.isFinite(n)) return n > 0 ? "Overflow" : "-Overflow";
  return String(n);
}

function applyBinary(a: number, b: number, op: BinaryOp): number {
  switch (op) {
    case "Add": return a + b;
    case "Subtract": return a - b;
    case "Multiply": return a * b;
    case "Divide": return a / b;
  }
}

function sym(op: BinaryOp): string {
  switch (op) {
    case "Add": return "+";
    case "Subtract": return "−";
    case "Multiply": return "×";
    case "Divide": return "÷";
  }
}

function digitValue(cmd: Command): number | null {
  switch (cmd) {
    case CommandId.Digit0: return 0;
    case CommandId.Digit1: return 1;
    case CommandId.Digit2: return 2;
    case CommandId.Digit3: return 3;
    case CommandId.Digit4: return 4;
    case CommandId.Digit5: return 5;
    case CommandId.Digit6: return 6;
    case CommandId.Digit7: return 7;
    case CommandId.Digit8: return 8;
    case CommandId.Digit9: return 9;
    default: return null;
  }
}

function opOf(cmd: Command): BinaryOp | null {
  switch (cmd) {
    case CommandId.Add: return "Add";
    case CommandId.Subtract: return "Subtract";
    case CommandId.Multiply: return "Multiply";
    case CommandId.Divide: return "Divide";
    default: return null;
  }
}

export class MockEngineApi implements EngineApi {
  public initial(): EngineState {
    return { ...initial };
  }

  public step(state: EngineState, command: Command): EngineState {
    if (state.isError) {
      // hard-error lock: only ClearAll (or typing a digit) recovers, mirroring Windows calc
      if (command === CommandId.ClearAll) {
        return state.memory !== undefined ? { ...initial, memory: state.memory } : { ...initial };
      }
      if (digitValue(command) !== null) {
        // fall through to fresh-state digit entry (memory is preserved)
        state = state.memory !== undefined ? { ...initial, memory: state.memory } : { ...initial };
      } else {
        return state;
      }
    }

    const digit = digitValue(command);

    // ---- digits / decimal / negate / backspace build the current entry ----
    if (digit !== null) {
      if (state.awaitingEntry) return { ...state, display: String(digit), awaitingEntry: false };
      if (state.display === "0") return { ...state, display: String(digit) };
      if (state.display === "-0") return { ...state, display: "-" + String(digit) };
      return { ...state, display: state.display + String(digit) };
    }

    if (command === CommandId.Decimal) {
      if (state.awaitingEntry) return { ...state, display: "0.", awaitingEntry: false };
      if (state.display.includes(".") || state.display.includes("e")) return state;
      return { ...state, display: state.display + "." };
    }

    if (command === CommandId.Negate) {
      if (state.display === "0" || state.display === "0.") return state;
      if (state.display.startsWith("-")) return { ...state, display: state.display.slice(1) };
      return { ...state, display: "-" + state.display };
    }

    if (command === CommandId.Backspace) {
      if (state.awaitingEntry) return state;
      if (state.display.length <= 1 || state.display.length === 2) {
        return { ...state, display: "0", awaitingEntry: state.display === "0" };
      }
      return { ...state, display: state.display.slice(0, -1) };
    }

    // ---- unary ----
    if (command === CommandId.Square || command === CommandId.Sqrt || command === CommandId.Inverse) {
      const n = Number(state.display);
      let out: number;
      if (command === CommandId.Square) out = n * n;
      else if (command === CommandId.Sqrt) out = Math.sqrt(n);
      else out = 1 / n;
      if (Number.isNaN(out)) return { ...state, display: "Invalid input", isError: true };
      if (!Number.isFinite(out)) {
        if (command === CommandId.Inverse && n === 0) return { ...state, display: "Error: 1/0",
          isError: true };
        return { ...state, display: n > 0 ? "Overflow" : "-Overflow", isError: true };
      }
      return { ...state, display: fmt(out), awaitingEntry: true, expression: "" };
    }

    // ---- percent ----
    if (command === CommandId.Percent) {
      const y = Number(state.display);
      let pct: number;
      if (state.pendingOp === "Add" || state.pendingOp === "Subtract") {
        pct = (state.accumulated ?? 0) * y / 100;
      } else {
        pct = y / 100;
      }
      return { ...state, display: fmt(pct), awaitingEntry: true };
    }

    // ---- binary operators ----
    const op = opOf(command);
    if (op) {
      if (state.awaitingEntry && state.pendingOp) {
        // typing a second operator before an operand replaces the pending operator
        return { ...state, pendingOp: op, expression: `${fmt(state.accumulated ?? 0)} ${sym(op)}` };
      }
      const cur = Number(state.display);
      if (state.pendingOp) {
        const next = applyBinary(state.accumulated ?? 0, cur, state.pendingOp);
        return {
          ...state,
          accumulated: next,
          display: fmt(next),
          pendingOp: op,
          expression: `${fmt(next)} ${sym(op)}`,
          awaitingEntry: true,
        };
      }
      return {
        ...state,
        pendingOp: op,
        accumulated: cur,
        lastOp: undefined,
        lastOperand: undefined,
        expression: `${fmt(cur)} ${sym(op)}`,
        awaitingEntry: true,
      };
    }

    // ---- equals ----
    if (command === CommandId.Equals) {
      if (state.pendingOp) {
        const cur = Number(state.display);
        const next = applyBinary(state.accumulated ?? 0, cur, state.pendingOp);
        if (state.pendingOp === "Divide" && cur === 0) {
          return { ...initial, display: "Cannot divide by zero", isError: true };
        }
        if (!Number.isFinite(next)) {
          return { ...state, display: "Overflow", isError: true, pendingOp: undefined, expression: "" };
        }
        return {
          ...state,
          accumulated: next,
          display: fmt(next),
          lastOp: state.pendingOp,
          lastOperand: cur,
          pendingOp: undefined,
          expression: "",
          awaitingEntry: true,
        };
      }
      // repeated `=`: repeat the last binary op with the same right operand (CEngine)
      if (state.lastOp && state.lastOperand !== undefined) {
        const next = applyBinary(Number(state.display), state.lastOperand, state.lastOp);
        if (state.lastOp === "Divide" && state.lastOperand === 0) {
          return { ...initial, display: "Cannot divide by zero", isError: true };
        }
        if (!Number.isFinite(next)) {
          return { ...state, display: "Overflow", isError: true };
        }
        return { ...state, accumulated: next, display: fmt(next), awaitingEntry: true };
      }
      return { ...state, expression: "", awaitingEntry: true };
    }

    // ---- clear ----
    if (command === CommandId.ClearAll) {
      // C clears state but NOT memory (MC clears memory; Windows calc behavior)
      return state.memory !== undefined ? { ...initial, memory: state.memory } : { ...initial };
    }
    if (command === CommandId.ClearEntry) return { ...state, display: "0", awaitingEntry: true };

    // ---- memory (CEngine memory workflow: M+/M− act on the current display value) ----
    if (command === CommandId.MemoryClear) {
      const { memory: _dropped, ...rest } = state;
      return rest;
    }
    if (command === CommandId.MemoryRecall) {
      if (state.memory === undefined) return state;
      // recalled value replaces the entry; a following digit starts fresh (Windows calc)
      return { ...state, display: fmt(state.memory), awaitingEntry: true, isError: false };
    }
    if (command === CommandId.MemoryStore) {
      return { ...state, memory: Number(state.display) };
    }
    if (command === CommandId.MemoryAdd) {
      return { ...state, memory: (state.memory ?? 0) + Number(state.display) };
    }
    if (command === CommandId.MemorySubtract) {
      return { ...state, memory: (state.memory ?? 0) - Number(state.display) };
    }

    return state;
  }
}
