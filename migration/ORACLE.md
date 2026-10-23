# ORACLE.md — who owns correctness

> **Status: ACTIVE (Step 1, revised 2026-10-22).** Edits require human sign-off.
>
> **Environment limitation (owner-confirmed): no C++/C# build toolchain is available on this
> machine.** Consequence: we CANNOT run the SOURCE engine tests to capture an execution
> baseline. The console-harness work under `migration/harness/` is therefore **deactivated**
> (kept as reference for any future machine with tooling; not part of the gate).
>
> ## Revised oracle strategy — "textual oracle"
> The five C++ test sources ARE the correctness definition. Correctness during the port is
> enforced by:
> 1. **Verbatim translation**: every assertion is ported with identical expected values and
>    identical input sequences, harvested by *reading* the C++ source (which is fully present).
> 2. **Reviewer enforcement**: for every ported unit, 2 independent reviewers verify the
>    C++→Rust test mapping line-by-line (not the implementer).
> 3. **No weakening**: a translated test may NOT assert less than its C++ original; if
>    something asserted cannot be expressed, the unit stops and the owner is consulted.
> 4. **Gap-filling property tests** for numeric invariants where the C++ suite relied on
>    incidental coverage (recorded in the Gaps table as they're added).

## Test classification

| Suite | Language-independent? | Verdict |
|---|---|---|
| `src/CalculatorUnitTests/RationalTest.cpp` | C++-tied (compiles against engine headers/API) | **SOURCE-tied** — travels with code as the oracle translated 1:1 to Rust |
| `src/CalculatorUnitTests/CalcInputTest.cpp` | same | SOURCE-tied oracle |
| `src/CalculatorUnitTests/CalcEngineTests.cpp` | same | SOURCE-tied oracle (covers `NumberFormattingUtils` + display grouping) |
| `src/CalculatorUnitTests/CalculatorManagerTest.cpp` | same | SOURCE-tied oracle (CalculatorManager end-to-end behaviors incl. memory/history/mode) |
| `src/CalculatorUnitTests/UnitConverterTest.cpp` | same | SOURCE-tied oracle (unit conversion + number formatting) |
| `src/Calculator.Tests/**` (C#) | exercises UI/ViewModel + engine through WinRT interop | **OUT OF SCOPE** by owner decision; treat as *reference-only*, not part of the oracle |
| `src/CalculatorUITests/**` | UI automation | OUT OF SCOPE |

**Important consequence** (recorded in PLAN.md too): because the oracle is translated from
C++-tied tests, protection is enforced during translation: translated assertions must carry
**identical expected values**, and the mapping from each C++ `TEST_METHOD` to its Rust `#[test]`
is recorded line-by-line in the translation commit. Any behavior not asserted in these suites
becomes a **documented gap** in the Gaps table below until a test is written (first against SOURCE,
then translated).

## Baseline runner (headless console)

UWP test host is scaffolding-only: `UnitTestApp.xaml.*`, `AsyncHelper.cpp` (UWP dispatcher,
unused by test bodies), and Helpers.h's unused C++/CX template `VERIFY_VECTORS_ARE_EQUAL`. By
inspection: no test `.cpp` file calls `AsyncHelper`, `create_task`, or
`VERIFY_VECTORS_ARE_EQUAL`. Therefore the baseline can be executed by a **console harness**
that compiles `src/CalcManager` (plain C++/std:c++20, `CompileAsWinRT=false` confirmed) plus
the 5 test translation units with:
- `migration/harness/shims/CppUnitTest.h` — MSTest-lite `Assert` + `TEST_CLASS`/`TEST_METHOD` macro shim
  registering methods in a console runner;
- a shim `pch.h` (overriding includes by path precedence so original `pch.h` files are untouched);
- a *derived copy* of `Helpers.h` compiled via the include-path precedence (the C++/CX unused
  template body exchanged for a plain-C++ no-op) — the only file physically generated at
  harness level, and it contains **no assertions** of its own.

Toolchain on this machine: VS 17.14.40 (toolset v145) with `cl.exe` available through
`Launch-VsDevShell.ps1`.

## Baseline (recorded 2026-10-22 — SOURCE CANNOT BE EXECUTED on this machine)
> **DEACTIVATED baseline runner**: `migration/harness/` (console runner + MSTest shims,
> built before the toolchain finding; kept as reference only — see note above).

Counts below are harvested from SOURCE TEXT (assert structures per file, running each method
is impossible here). Per-file method counts from source inspection:

| Test source | methods (from TEST_METHOD text) | assertions |
|---|---|---|
| RationalTest.cpp | 9 | 6 direct Assert::Fail + macro-driven VERIFY_* |
| CalcInputTest.cpp | 37 | macro-driven VERIFY_* (all via Helpers.h macros) |
| CalcEngineTests.cpp | 4 | macro-driven VERIFY_* |
| CalculatorManagerTest.cpp | 21 | macro-driven VERIFY_* |
| UnitConverterTest.cpp | 16 | macro-driven VERIFY_* |
| **total** | **87** | (per-assertion counts recorded during translation, per unit) |

Performance baseline: **N/A in this environment** (no C++ execution). Rust criterion
benchmarks recorded against documented expectations; absolute-parity claims are explicitly
out of reach and recorded as an accepted limitation in PLAN.md.

## Protection rule
- Oracle test files are translated to Rust **with identical assertion values**; the C++→Rust
  test mapping is reviewed by the two reviewers (not the implementer) on every unit.
- Translated Rust tests land per PORTING.md §9: per-C++-source integration files at
  `engine/tests/<cpp_name>.rs` (e.g. `engine/tests/rational_test.rs`), additive (non-C++)
  tests in-module as `#[cfg(test)]`.
- asserted-behavior drift: any time a test's expected value or coverage shrinks during port,
  STOP; report in `LESSONS.md` with a status of `blocked`; repairs require human approval.
- No waiver label is applied to any of these tests; waivers are granted only by the project
  owner in writing, one at a time, never retroactively.

## Verifying the oracle actually executes
**In this environment this step cannot be performed by execution.** Replacement done instead
(can, run when tooling exists): after the FIRST unit (u01) is translated, its Rust tests are
run; the mapping from each C++ TEST_METHOD to its Rust #[test] is 1:1-reviewable in the diff,
giving the equivalence proof by review rather than by execution. Recorded here as an
environment limitation, owner-approved.

## Gaps (unasserted) — to close before/during port
(row per gap; move item to the tested list when covered)
- to be populated after baseline inspection (Step 1)
