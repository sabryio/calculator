# STATUS.md — migration dashboard

> Regenerate the Snapshot below via `pwsh migration/status.ps1`; never hand-edit counts.

## Snapshot
(placeholder — run `migration/status.ps1`)

## Now
- Step 4 (machinery + pilots) executed 2026-10-23: `engine/` crate created (Cargo lints
  forbid-unsafe + clippy all/pedantic, `rust-toolchain.toml` pin, `rustfmt.toml`,
  CI `.github/workflows/engine.yml`: fmt / clippy -D / test / release build, all -locked
  where sensible). PILOTS u01 (NumberFormattingUtils) + u02 (Command/EngineStrings/
  RadixType/IResourceProvider) ported → 2 fresh-context reviewers (fidelity + operability)
  → ALL findings fixed (CommandType enum added, cross-space duplicate/gap additive test,
  toolchain file renamed to `engine/rust-toolchain.toml`, engine/.gitignore /target/,
  license headers, PORTING §3 exponent rule corrected to min-2 from golden literals,
  §5 structural-expect case, §6 IResourceProvider String decision, §9 test-placement split,
  ORACLE.md placement alignment). Final gates green: 8/8 cargo tests, clippy -D warnings,
  fmt, release build. Landing: commit `engine/` + workflow + guide patches.
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
2. Wave 2 kickoff: u03 ratpak core through the per-unit loop (the blockers in PORTING §2/§7
   apply: taylor macros, ratconst transcription, Context construction-order invariant).
   Wave-2 template = the pilot layout (engine/src/<unit>.rs + tests/<cpp_name>.rs).

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
- 2026-10-23 — STEP 4 + PILOTS LANDED. Machinery: `engine/` crate (lints forbid-unsafe,
  clippy all+pedantic), `engine/rust-toolchain.toml` (NOTE: rustup ignores dot-prefixed
  `.rust-toolchain.toml` — lesson from reviewer B), `engine/rustfmt.toml`,
  `engine/.gitignore`, CI workflow. Pilots: u01 (number_formatting_utils.rs) and
  u02 (command.rs/engine_strings.rs/calculator_resource.rs/radix_type.rs) ported mechanically;
  oracle slice CalculatorManagerTest.cpp:978-1076 → engine/tests/calculator_manager_test.rs
  (5/21 methods; 16 remain with u08 — must EXTEND this file). Two fresh-context reviewers
  (fidelity ses_e95dd7... / operability ses_e95d4f...) returned 10+ findings, all fixed
  same-session. Final gates: 8/8 tests, clippy -D warnings (all+pedantic), fmt, release —
  all green. Inventory u01/u02 → reviewed; u10 no-phase-overlap note added.
- 2026-10-23 — PILOT CORRECTION in guides: MSVC scientific exponent is min-2-digit
  (`e+03`), NOT 3-digit as reviewer claimed at Step 3; golden literals arbitrated; PORTING
  §3 patched; LESSONS standing rule 4 states the rule-of-evidence.
- 2026-10-23 — landed as commit 80c7df1; last_verified_commit: fecf47a → 80c7df1.
