// Display: expression readout + main value. The value line is a polite live region so
// screen readers announce results; error text replaces the value entirely.
import { type EngineState } from "../engine/types";

function sizeFor(text: string): "lg" | "md" | "sm" | "xs" {
  const n = text.length;
  if (n <= 9) return "lg";
  if (n <= 12) return "md";
  if (n <= 16) return "sm";
  return "xs";
}

export function Display({ state }: { state: EngineState }) {
  return (
    <div className="calc__display">
      <div className="calc__expression" role="presentation" aria-hidden="true">
        {state.expression}
      </div>
      <div
        className={state.isError ? "calc__value is-error" : "calc__value"}
        data-size={state.isError ? undefined : sizeFor(state.display)}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {state.display}
      </div>
    </div>
  );
}
