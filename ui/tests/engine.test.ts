// Engine mock behavior tests (bun test). These double as executable documentation of the
// semantics the future Rust engine port must preserve; when the port lands, the same
// scenarios run through the Tauri adapter.
import { describe, expect, test } from "bun:test";

import { MockEngineApi } from "../src/engine/mock";
import { CommandId, type CommandId as Command, type EngineState } from "../src/engine/types";

const engine = new MockEngineApi();

function run(cmds: Command[], from?: EngineState): EngineState {
  let s = from ?? engine.initial();
  for (const c of cmds) s = engine.step(s, c);
  return s;
}

describe("entry building", () => {
  test("digits replace awaiting entry", () => {
    expect(run([CommandId.Digit1, CommandId.Digit2, CommandId.Digit3]).display).toBe("123");
  });
  test("no stacked leading zeros", () => {
    expect(run([CommandId.Digit0, CommandId.Digit0, CommandId.Digit5]).display).toBe("5");
  });
  test("decimal in fresh entry becomes 0.", () => {
    expect(run([CommandId.Decimal]).display).toBe("0.");
  });
  test("one decimal point per entry", () => {
    expect(run([CommandId.Digit1, CommandId.Decimal, CommandId.Decimal, CommandId.Digit5]).display).toBe("1.5");
  });
  test("negate toggles", () => {
    const s = run([CommandId.Digit2, CommandId.Negate]);
    expect(s.display).toBe("-2");
    expect(engine.step(s, CommandId.Negate).display).toBe("2");
  });
  test("negate zero is a no-op", () => {
    expect(run([CommandId.Negate]).display).toBe("0");
  });
  test("backspace shrinks to 0", () => {
    expect(run([CommandId.Digit1, CommandId.Digit2, CommandId.Backspace, CommandId.Backspace]).display).toBe("0");
  });
});

describe("binary operations", () => {
  test("simple add equals", () => {
    expect(run([CommandId.Digit2, CommandId.Add, CommandId.Digit3, CommandId.Equals]).display).toBe("5");
  });
  test("chained operators resolve left-to-right", () => {
    // after 2 + 3 then ×, the running total sits in state; display shows the new entry
    const s = run([CommandId.Digit2, CommandId.Add, CommandId.Digit3, CommandId.Multiply]);
    expect(s.display).toBe("5");
    const mid = engine.step(s, CommandId.Digit4);
    expect(mid.display).toBe("4");
    expect(engine.step(mid, CommandId.Equals).display).toBe("20");
  });
  test("second operator replaces pending", () => {
    expect(run([CommandId.Digit2, CommandId.Add, CommandId.Multiply, CommandId.Digit3, CommandId.Equals]).display).toBe("6");
  });
  test("expression readout shows pending", () => {
    expect(run([CommandId.Digit2, CommandId.Add]).expression).toBe("2 +");
  });
  test("repeated equals repeats last op", () => {
    const s = run([CommandId.Digit2, CommandId.Add, CommandId.Digit3, CommandId.Equals]);
    expect(s.display).toBe("5");
    expect(engine.step(s, CommandId.Equals).display).toBe("8");
  });
});

describe("unary operations", () => {
  test("square", () => {
    expect(run([CommandId.Digit9, CommandId.Square]).display).toBe("81");
  });
  test("sqrt", () => {
    expect(run([CommandId.Digit9, CommandId.Sqrt]).display).toBe("3");
  });
  test("sqrt of negative is an error", () => {
    const s = run([CommandId.Digit9, CommandId.Negate, CommandId.Sqrt]);
    expect(s.isError).toBe(true);
    expect(s.display).toBe("Invalid input");
  });
  test("inverse", () => {
    expect(run([CommandId.Digit4, CommandId.Inverse]).display).toBe("0.25");
  });
  test("error state blocks input", () => {
    const s = run([CommandId.Digit9, CommandId.Negate, CommandId.Sqrt]);
    expect(engine.step(s, CommandId.Add)).toBe(s); // same object = ignored
  });
  test("digit after error restarts", () => {
    const s = run([CommandId.Digit9, CommandId.Negate, CommandId.Sqrt]);
    expect(engine.step(s, CommandId.Digit5).display).toBe("5");
    expect(engine.step(s, CommandId.Digit5).isError).toBe(false);
  });
});

describe("percent", () => {
  test("+ pending: y% of accum", () => {
    expect(run([CommandId.Digit2, CommandId.Digit0, CommandId.Digit0, CommandId.Add,
      CommandId.Digit1, CommandId.Digit0, CommandId.Percent]).display).toBe("20");
  });
  test("× pending: y/100", () => {
    expect(run([CommandId.Digit2, CommandId.Digit0, CommandId.Digit0, CommandId.Multiply,
      CommandId.Digit1, CommandId.Digit0, CommandId.Percent]).display).toBe("0.1");
  });
  test("no pending: y/100", () => {
    expect(run([CommandId.Digit5, CommandId.Percent]).display).toBe("0.05");
  });
});

describe("hard error paths", () => {
  test("divide by zero", () => {
    const s = run([CommandId.Digit1, CommandId.Divide, CommandId.Digit0, CommandId.Equals]);
    expect(s.display).toBe("Cannot divide by zero");
    expect(s.isError).toBe(true);
  });
  test("clear all recovers", () => {
    const s = run([CommandId.Digit1, CommandId.Divide, CommandId.Digit0, CommandId.Equals]);
    expect(engine.step(s, CommandId.ClearAll)).toEqual(engine.initial());
  });
});
