# STATUS.md — migration dashboard

> Regenerate the Snapshot below via `pwsh migration/status.ps1`; never hand-edit counts.

## Snapshot
(placeholder — run `migration/status.ps1`)

## Now
- Step 3 (guides) executed 2026-10-23: source walk done (3 read-only explorers over Ratpak /
  CEngine / Manager+Converter), PORTING.md + STATE_MAP.tsv + DEPENDENCIES.tsv written from
  file:line evidence, 2 fresh-context reviewers returned findings, ALL findings applied
  (taylor-macro expansion rules, ratconst.h transcription rule, command-ID-space rule,
  engine-strings key rules, exact NumberFormatting recipes, Context construction-order
  invariant, Rational &Context threading, missing STATE_MAP rows, DEPENDENCIES gaps,
  LESSONS.md entries). Step 3 gate: guides approved by both reviewers' findings being
  resolved; formally pending owner read of PORTING.md (skill requirement).
- 13 "found in source" facts recorded in LESSONS.md (UB sites, dead code, API asymmetries,
  process-wide state traps, deliberate-Behavior trip points repeated at C-clear).

## Next
1. Owner reads PORTING.md (skill Step 3 gate requirement), then:
2. Step 4: Rust workspace machinery at `engine/` (workspace Cargo.toml + .rust-toolchain pin +
   lints + CI config per references/rust-porting.md §1) + pilot port of u01 (num-formatting)
   + u02 (command enums/resources) through the full per-unit loop.
3. Wave 2 kickoff: u03 ratpak core (the blockers in PORTING §2/§7 apply).

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
- 2026-10-23 — Resumed after UI phase. Re-diff since 79e1ac5: commits 66357e7 (migration
  record + UI scaffold) and fecf47a (Tauri migration) landed; ZERO changes under
  src/CalcManager or src/CalculatorUnitTests → no inventory rows reopened; oracle untouched.
- 2026-10-23 — Step 3 gate work: fixed misquotes (0x763→763 decimal, rat_word vs rat_byte
  citation, raaUi32→rattoUi32 naming, line refs), removed ghost identifiers, added blocker
  rules (CREATETAYLOR/DESTROYTAYLOR expansion, ratconst.h literal transcription,
  command-ID-space conversions, engine-strings load semantics, Context construction ordering,
  Rational &Context threading, MSVC scientific-format recipe, g_ratio log2 pin test).
- 2026-10-23 — Surprise: the walk found real SOURCE bugs (INT32_MIN negation UB in i32tonum,
  UB in CalculatorVector RemoveAtEnd/SetAt dead catch, rat_byte double-init line, modrat
  passing BASEX as precision) — all recorded in LESSONS.md "Found in source", behavior
  preserved pending owner decisions.
- 2026-10-23 — last_verified_commit updated: 79e1ac5 → fecf47a (guides verified against the
  tree as of fecf47a; no SOURCE movement).
