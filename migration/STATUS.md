# STATUS.md — migration dashboard

> Regenerate the Snapshot below via `pwsh migration/status.ps1`; never hand-edit counts.

## Snapshot
(placeholder — run `migration/status.ps1`)

## Now
- MIGRATION **DEFERRED by owner** (2026-10-22): session pivots to building the React UI first.
  Engine port work (guides + branches u01–u10) resumes after the UI phase — resume protocol
  applies: re-read PLAN/STATUS/ORACLE/LESSONS + re-diff since `last_verified_commit`.

## Next (when engine port resumes)
1. Step 2/3: unit dependency confirmation + PORTING.md/STATE_MAP.tsv/DEPENDENCIES.tsv from a
   full source walk ( textual-oracle strategy per ORACLE.md).
2. Step 4: Rust workspace machinery at `engine/` + pilot u01 (num-formatting) + u02 (enums).
3. Regardless of later UI build, the UI work should define the `engine/` public API shape
   consumed via mock — align that API shape with the port as the port starts (API-first).

## Blockers
- Engine port: deferred by owner (React UI first) — NOT blocked technically.

## Trend
| date | oracle pass/fail/skip | remaining SOURCE in scope (LOC) | seam size | open regressions |
|------|------------------------|---------------------------------|-----------|------------------|
| 2026-10-22 | baseline not yet captured | ~12,500 (CalcManager LOC, measured) | 0 | 0 |

## Session log
- 2026-10-22 — Step 0 intake complete. Source = C++ CalcManager (~12.5k LOC self-contained,
  isolated from WinRT via `sal_cross_platform.h`); Target = Rust. Interop seam identified as
  `CalcManager.Interop` (thin C++/IDL wrapper used by C# UI). Test suites identified:
  `CalculatorUnitTests` (C++ MSTest), `Calculator.Tests` (C#), `CalculatorUITests` (WinAppDriver).
  Surprised: CalcManager is already cross-platform-friendly — a strong signal the port
  boundary is sane.
- 2026-10-22 — `last_verified_commit` = 79e1ac5 (Harden snapshot replay and integer powers #2511).
- 2026-10-22 — Step 0 gate cleared. Owner decisions: engine-only validation (NO interop seam,
  C# XAML app intentionally left non-building; dropped from migration scope), 2 reviewers/unit,
  big-bang-per-wave on a branch with oracle translation, C++ deleted at convergence. Strategy
  and end-state sentence updated in PLAN.md; u10 interop-seam unit removed from inventory.
- 2026-10-22 — status.ps1 built and verified (regenerates snapshot from inventory.tsv + repo:
  10 units, all todo, 13,583 SOURCE LOC in scope).
- 2026-10-22 — ENVIRONMENT FINDING: no C++/C# build toolchain usable on this machine
  (owner-confirmed mid-Step 1). Console harness approach deactivated (kept as reference in
  migration/harness/). Oracle strategy switched to "textual oracle" — translation of the C++
  test sources with verbatim assertion values, enforced by 2-reviewer manual diff rather than
  execution. PLAN.md success criteria updated (criterion 1 translated-assertion-parity,
  criterion 3 property tests, criterion 4 benchmarks without C++ anchor, criterion 5 C++
  deletion/quarantine). Public Rust API must also cover the CalcManager workflow surface the
  C# UI used (modes/memory/history/date/radix display), so a React-first UI can consume it.
- 2026-10-22 — owner direction: UI will be React first (Tauri thereafter); UI remains OUT of
  this migration's scope per skill discipline; recorded as the next project after engine port
  or in parallel by the owner.
