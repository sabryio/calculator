// Engine boundary: the public API the React UI consumes.
//
// This is the contract the future Rust engine (the CalcManager port) must satisfy once it
// is wired in via Tauri + `invoke`. The mock engine (`engine/mock.ts`) implements it today
// so the UI can be built and reviewed before the port begins.
//
// Command vocabulary mirrors the C++ engine's workflow surface (NumbersAndOperatorsEnum
// in src/Calculator.ViewModels/Common/NumbersAndOperatorsEnum.cs) reduced to what standard
// mode + the UI actually sends. Keep names aligned with the C++ enum when the port adds
// modes beyond standard.

export const CommandId = {
  Digit0: "Digit0",
  Digit1: "Digit1",
  Digit2: "Digit2",
  Digit3: "Digit3",
  Digit4: "Digit4",
  Digit5: "Digit5",
  Digit6: "Digit6",
  Digit7: "Digit7",
  Digit8: "Digit8",
  Digit9: "Digit9",
  Decimal: "Decimal",
  Negate: "Negate",
  Add: "Add",
  Subtract: "Subtract",
  Multiply: "Multiply",
  Divide: "Divide",
  Equals: "Equals",
  Percent: "Percent",
  Square: "Square",
  Sqrt: "Sqrt",
  Inverse: "Inverse",
  ClearAll: "ClearAll",
  ClearEntry: "ClearEntry",
  Backspace: "Backspace",
} as const;

export type CommandId = (typeof CommandId)[keyof typeof CommandId];

export type BinaryOp = "Add" | "Subtract" | "Multiply" | "Divide";

export interface EngineState {
  /** Current entry or result, formatted for display (may be negative/exponentuated). */
  display: string;
  /** Small readout above the main display; empty when there is no pending operation. */
  expression: string;
  /** True when the engine is reporting a hard error (divide by zero, sqrt of negative). */
  isError: boolean;
  /** True when the next digit starts a fresh entry (after =, after an operator, or on
   *  operator typing); false while the user is still building the current entry. */
  awaitingEntry: boolean;
  // ---- internal, fully serializable (the Rust engine owns these once it lands) ----
  /** Left operand of a pending binary op. */
  accumulated?: number;
  /** Pending binary operator. */
  pendingOp?: BinaryOp;
  /** Last operation + right operand, for repeated `=` (CEngine semantics). */
  lastOp?: BinaryOp;
  lastOperand?: number;
}

export interface EngineApi {
  /** Pure step: apply one command to a state and return the next state. */
  step(state: EngineState, command: CommandId): EngineState;
  /** Initial state, e.g. what a fresh calculator shows. */
  initial(): EngineState;
}
