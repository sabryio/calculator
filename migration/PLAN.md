# Migration Plan: Windows Calculator CalcManager → Rust

Drafted by language-migration Step 0. Status: **USER-CONFIRMED 2026-10-22** (Step 0 gate).
Revised 2026-10-22 after environment finding: **no usable C++/C# build toolchain on this
machine** (owner-confirmed) — see ORACLE.md for the replacement oracle strategy.

## Why migrate
The project is Microsoft's Windows Calculator: a UWP C#/XAML app whose compute core is a
self-contained native C++ library (`src/CalcManager`, ~14k lines: Ratpak arbitrary-precision
math, CEngine eval stack, CalculatorManager, UnitConverter). The C# UI, interop, and UWP
test host are **not buildable on this machine** and, per owner decision, all leave scope:
the destination is a Rust engine workspace consumed by a future **React** UI (Tauri-era).

## Owner decisions (recorded, binding)
- **Scope**: port the CalcManager engine core to Rust. **Engine-only validation** — the
  rebuilt interop wrapper is explicitly NOT part of this migration; the C# XAML app is not
  a consumer anymore (UI will be React first, then Tauri-era service usage).
- **Reviewers**: 2 independent fresh-context reviewers per ported unit.
- **Environment constraint**: no C++/C# build capability on this machine. SOURCE can be
  *read* (translation anchor) but not compiled/executed. Accepted consequence: the oracle
  cannot run against SOURCE for a baseline; see ORACLE.md.
- **Strategy**: branch-based "port + translate-oracle, then delete C++" (see below).

## SOURCE / TARGET / scope
- **SOURCE**: `src/CalcManager/**` C++ (Ratpak, CEngine, CalculatorManager, UnitConverter) —
  13,583 LOC measured (code + headers, excluding pch/rc/natvis).
- **TARGET**: Rust, workspace at `engine/` — a plain Rust library (`cargo test` over a public
  Rust API). No FFI/C-ABI export requirement in this migration (no C# consumer remains).
- **Out of scope (this plan)**: XAML Views/Controls, `GraphControl` (DirectX), `GraphingImpl`,
  UI rebuild in Tauri, `CalcManager.Interop` rebuild, packaging/store signing changes.
  Recorded as the redesign backlog once Phase 1 lands.

## End state (checkable sentence)
> The Rust workspace `engine/` fully replaces `src/CalcManager` as the compute core: the ported
> engine exposes a public Rust API covering every C++ engine behavior carried by the five
> `CalculatorUnitTests` sources (translated 1:1 to Rust tests with identical assertion values,
> running under `cargo test`), the CEngine command/display workflow surface that the C# UI
> consumed is represented in the public Rust API so a React/Tauri UI can consume it, and
> `src/CalcManager` (+ interop) are deleted or quarantined by owner decision. The XAML app
> layers are NOT part of the end state (UI will be React-first; Tauri later).

## Success criteria (revised 2026-10-22 for no-C++-toolchain environment)
1. **Oracle parity by translation**: every assertion in the five C++ test sources is carried
   into Rust with **identical expected values and identical input permutations** (counts
   recorded per file in ORACLE.md from source text, not execution). Zero tests silently
   dropped; mapping table reviewed by 2 reviewers per unit.
2. **API-completeness for UI consumption**: the engine workflow surface exercised by the C#
   UI layer only through `CalcManager.Interop` (modes, radix base display updates, memory,
   history, date calc workflow) is represented in the public Rust API surface, verified by
   reading callers AND compiling the interop expectations into Rust-side test doubles
   (mock display/test objects live INSIDE the C++ test sources; ported II-faceid equivalents
   must exist for the tests to compile in Rust).
3. **Property tests added where execution-parity is impossible**: for numeric classes where
   the C++ oracle could have caught silent numerics drift (Ratpak precision, radix
   conversions), we add RoundTrip/consistency property tests over the Rust implementation
   against documented invariants read from SOURCE (this is gap-filling, recorded in ORACLE.md).
4. **Benchmark record**: criterion benchmarks for representative operations (memory slot
   manipulations, radix conversions, session workflows); recorded, with the caveat that no
   C++ baseline exists on this machine so asolute parity can't be asserted here.
5. **Zero dead engine**: `src/CalcManager` and `src/CalcManager.Interop` are deleted (or
   moved to `archive/` with owner sign-off recorded here), and `engine/` builds + passes
   `cargo test` + `cargo nextest` clean.

## Ambient behavior inventory (known so far; refined in Step 3)
- Locale/culture: passes into the engine as an explicit localized-string provider via
  `EngineStrings`/`CalculatorResource` keys — the engine itself must stay locale-agnostic and
  receive formatting rules explicitly (verify in `sciset.cpp`/`conv.cpp` during Step 3).
- Integer widths: engine uses `int`/`long`/`unsigned`; explicit per-field Rust mapping required
  (see §9 int-overflow class in the divergence checklist).
- Allocation: Ratpak uses `malloc`/`free` semantic C allocation (see `ratpak.h` macros) —
  Rust port must define ownership clearly; this is a `STATE_MAP.tsv` first-class entry.

## Semantic-divergence focus areas (predicted from a code walk; refined per unit)
- Arbitrary-precision rational: scaling/precision constants (e.g. `NUMCALCDIGITS`) must be
  preserved exactly, including *where* they clamp/grow.
- C-style implicit narrowing (`unsigned`↔`int`, `long`↔`int`) throughout Ratpak.
- Pointer-into-buffer aliasing in Ratpak's mantissa manipulation.
- Callback interfaces (`ICalcDisplay`, `IHistoryDisplay`) → Rust trait objects.
- Exception taxonomy: engine raises structured errors (`CalcErr.h`, `winerror_cross_platform`)
  mapped to Rust `Result`/typed errors.

## Strategy: **branch-based port + oracle translation, then delete SOURCE**
Rationale recorded per the skill's strategy table:
- Owner chose engine-only validation: no interop seam, so the classical in-place shim loop has
  no consumer to serve. This is effectively a **big-bang-per-wave** port on a branch, validated
  by the translated C++ MSTest suite, with C++ deleted at convergence.
- The oracle is strong and language-independent-ish (>650 behavioral assertions across
  `RationalTest`, `CalcEngineTests`, `CalcInputTest`, `CalculatorManagerTest`,
  `UnitConverterTest`); it must be **translated to Rust with identical assertion values**
  (human-approved oracle migration, recorded in `ORACLE.md`).
- Dual-maintenance is explicitly forbidden for CalcEngine state (CalculatorManager's display/
  memory/history state is stateful and coupled) — never both engines swappable at once.
- Per-unit replacement order (leaves → hubs): pure utilities → Ratpak primitives → advanced
  math → rational types → CEngine eval → expression commands → CalculatorManager →
  UnitConverter → oracle completion → C++ deletion.
- Every landed unit retains green `cargo check/clippy/test` before `landed` status is set.

## Budget / cadence (owner-confirmed)
- Preference: lean, engine-core-only, aggressively automated reviews; one careful reviewer per
  unit is acceptable if it is a fresh context (skill mandates ≥2 distinct reviewers; this plan
  records the deviation as a user-approved exception, not a silent one — revisit at Step 5 gate
  with a dry run before any waiver is assumed).
- Session-driven: coordinator (this agent) drives; each unit claimed through the standard loop
  described in the skill.

## Non-goals
- No redesign of algorithms while porting (translate-first rule).
- No new features in ported engine code.
- No UI work in this plan (Tauri is the next plan after this one closes).

## Open questions resolved (2026-10-22)
1. Fork-status fact: accepted as-is (single-developer fork, low churn).
2. Rust toolchain pin: `stable` + `rustfmt` + `clippy` (standard; noted, resolved by default).
3. Reviewer count: **2 per unit** (skill default kept).
4. Workspace name/path: `engine/` confirmed by plan acceptance.
5. XAML consumer: **dropped by owner decision** (engine-only validation).

## Gates (per skill Steps)
Step 0 ✓ this file → Step 1 oracle → Step 2 inventory/units → Step 3 guides → Step 4 machinery
+ pilots → Step 6 waves → Step 8 convergence → Step 9 release-watch → Step 10 closure.
