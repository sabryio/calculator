# PORTING.md — idiom map, banned constructs, conventions, divergence rules

> **Status: ACTIVE (Step 3 draft, 2026-10-23).** Written from the Step-3 source walk
> (Ratpak/CEngine/Manager walks; file:line evidence in each rule). Reviewed: pending
> 2-reviewer pass. Every downstream port agent treats this as ground truth. Seed basis:
> `references/rust-porting.md` §3–§9, overridden below wherever the actual code demands it.
>
> Rule of rule-making: a construct not covered here → STOP the unit, add the rule, resume.

## 0. Ground rules

- **Translate first.** No fixes, no optimizations, no renames-for-taste. SOURCE bugs are
  recorded in LESSONS.md "Found in source" and *preserved* unless the owner decides otherwise.
- **Naming preservation**: C++ identifiers keep their names, mechanically cased:
  `NameSpace::Thing` → `snake_case` functions/modules, `PascalCase` types, `SCREAMING_SNAKE`
  constants stay `SCREAMING_SNAKE`. The identity mapping table (ratpak function → Rust fn) is
  the diffuse review anchor for reviewers; do not rename anything "to be idiomatic".
- **Wildcard decisions are forbidden.** Every integer width below was read off a real
  declaration; if a port site disagrees with the table, STOP and patch this file, not the port.

## 1. Numeric / integer-width map (verified against actual declarations)

| SOURCE (decl site) | Rust | Notes |
|---|---|---|
| `MANTTYPE` (ratpak.h:31) | `u32` | digit word; internal values ≤ BASEX-1 (0x7FFF_FFFF) |
| `TWO_MANTTYPE` (ratpak.h:32) | `u64` | product/carrier width in mul; masking to BASEX is exact (BASEXPWR=31) |
| `NUMBER.sign / cdigit / exp` (ratpak.h:58-62) | `i32` | `cdigit`/`exp` can be negative (negative exponents) |
| `precision` (param throughout ratpak) | `i32` | *negative precision is representable at call sites*: conv.cpp:312 does `uint32_t cdigits = precision + 1;` — port that site as a documented `i32→u32` bit-cast (`as u32`) with a `// SOURCE: conv.cpp:312` comment; never saturate |
| `radix` | `u32` | UI radix 2..16; internally also BASEX |
| `OpCode = uintptr_t` (CalcUtils.h:6) | `u32` | command IDs max **763 decimal** (`IDC_BINEDITEND 763`, CCommand.h:243-244); uintptr width was never load-bearing |
| `int` engine state (`m_nOpCode`, `m_nLastCom`, `m_nOp[]`, `m_nPrecOp[]`) | `i32` | plain arithmetic, comparisons vs IDC_* |
| `size_t` counts (`m_openParenCount`, `m_precedenceOpCount`, `m_decPtIndex`, vector sizes) | `usize` | only where the SOURCE indexes/counts; never silently narrowed |
| `UINT32/uint32_t` return of `IsNumberInvalid/grouping` | `u32` | |
| `double` (UnitConverter ratios, stod, log10) | `f64` | no float changes; record rounding-mode differences (§7) |
| `wchar_t` separators (`g_decimalSeparator`, `m_decimalSeparator`, `m_groupSeparator`) | `char` | single-code-point handling only; errors on surrogate → STOP (does not occur in separ) |
| `bool` | `bool` | |

**Arithmetic fidelity rules (DIVERGENCE-CRITICAL):**
- C++ signed arithmetic wraps-as-UB; Ratpak probes showed these sites: `i32tonum` negation
  (conv.cpp:815-819, INT32_MIN), exponent accumulation (conv.cpp:675-676), `numtoi32`
  accumulation loop (conv.cpp:1001-1009), `digit = radix - 1` assignment narrowing
  (num.cpp:425; declaration at 421; mixed signed/unsigned compare at 423), `_divnumx`
  `digit *= 2` without guard (basex.cpp:301-330), exp accumulation
  in `StringToRat` (`abs(expt)`, conv.cpp:445-446). **Port each with the minimal faithful
  primitive**: `wrapping_mul/wrapping_add/wrapping_neg` where SOURCE operates on in-range
  values *by design of the input envelope*, and a `TRY`-stop where SOURCE relies on the input
  being pre-validated. Record every use with a `// SOURCE: site` comment.
- C++ `(int)` casts of size math (`memmove` length casts, num.cpp:449 etc.) are pointerish
  noise: in Rust the length is `usize` by construction — no cast, no divergence. Do not
  re-introduce "forbidden magic" widths.
- Integer *negation* of values that cannot be reached as INT32_MIN: still write
  `wrapping` or an explicit `debug_assert`; never silent release-only differences.
- Anything mixing `int32`/`uint32` indexes (conv.cpp:319, num.cpp:429): compute in `i64`
  then down-cast with a documented bound (and the bound must exist in SOURCE logic).

## 2. Type-structure map (heap → value)

| SOURCE | Rust | Lifetime rule |
|---|---|---|
| `PNUMBER`/`NUMBER` flexible-array (ratpak.h:58-66, malloc'd at `_createnum`) | `struct Number { sign: i32, exp: i32, digits: Vec<u32> }` — value type, owned `Vec` replaces the fixed-array-append arena; `cdigit == digits.len()` | no manual free; the Rust type is `Drop`-free |
| `PRAT`/`_rat{pp,pq}` (ratpak.h:76-80) | `struct Rat { num: Number, den: Number }` — value type | RATs are constructed fresh per op (C++ did the same via ToPRAT/destroyrat dance) |
| `DUPNUM/DUPRAT` destroy-then-copy macros (ratpak.h:134-144) | **collapse**: `.clone()` (deep) or move-by-take; never keep a "null PNUMBER" sentinel. Pattern `createnum; _dupnum` → `Number { ..src.clone() }`; `destroyrat(x); x = rat2;` → `*x = rat2` or `swap` | |
| `_Inout_ PRAT*` smash-in-call convention (ratpak.h:338+ passim) | `fn addrat(&mut self, other: &Rat, radix: u32, precision: i32)` (method on `Rat`) or free fn taking `&mut Rat` — the out-param becomes the receiver | |
| `_createnum` size + malloc (conv.cpp:193-214) | `Vec::with_capacity` | C++ size math + CALC_E_OUTOFMEMORY throws become plain Vec growth |
| Flexible-array memmove digit shifting (num.cpp:449, basex.cpp:337, support.cpp:695) | `Vec::insert/remove/splice` or index loops; never memcpy-equivalent API in Rust public surface | |
| intsafe shim `Calc_ULongAdd/Calc_ULongMult/Calc_UInt32x32To64` (conv.cpp:45-100) | plain checked `u32/u64` arithmetic + `CalcError::InvalidRange` | the THROW at conv.cpp:209-211 is this variant's only producer — carry the mapping |
| **ratpak.h macro layer** (no macro survives as a macro) | expand at call sites, per sub-rule below | reviewed line-by-line |
| Value-semantics `CalcEngine::Rational { Number m_p, Number m_q }` (Rational.h:17-74) | `struct Rational { num: Number, den: Number }` — owned, `Clone` deep | |
| `std::array<Rational,25>` paren/precedence stacks (CalcEngine.h) | `[Rational; 25]` + separate top-index fields | C++ "stack contents persist after C" behavior preserved (do not clear bulk) |
| `CalcInput`/`CalcNumSec` (CalcInput.h:43-80) | struct-of-`String`/`Vec<char>` if index-manipulation needs char units | MAX_STRLEN=84 cap must exist as a *behavioral* cap, test-visible |

**Macro expansion sub-rules (BLOCKERS for u03/u04 — verified call sites):**
- `CREATETAYLOR()`/`DESTROYTAYLOR()` (ratpak.h:264-281) are used at 12 sites (exp.cpp:45/58,
  131/152; itrans.cpp:67/76, 177/190, 262/276; itransh.cpp:70/83; trans.cpp:69/82, 155/169;
  transh.cpp:76/88). Expansion pattern: declare `xx/n2/pret/thisterm` locals,
  `let mut xx = (*px).clone()`, run the series, and — before the LAST fallible step —
  `*px = pret`assignment INTO *px into `*px`. **Never** `?`-propagate after *px
  destruction begins: in C++, a throw between CREATETAYLOR and DESTROYTAYLOR leaves `*px`
  untouched (DESTROYTAYLOR never runs) — the Rust `?` port must see the same final state.
- `DUPNUM/DUPRAT/INC/MSD/ABSRAT/LOGNUMRADIX/LOGNUM2/LOGRAT2/LOGRATRADIX/TRIMNUM/TRIMTOP/
  SMALL_ENOUGH_RAT/RENORMALIZE/MULNUM/DIVNUM/NEXTTERM` (ratpak.h:147-312): each becomes a
  plain Rust fn named after the macro (e.g. `inc()`, `msd()`) touching only explicit
  parameters — the macros' implicit capture of `precision`/`g_ftrueinfinite`/`g_ratio` becomes
  `&Context` (§7) parameters. No implicit capture survives translation.
- `SIGN()` (ratpak.h:152-162 family) reads `g_ftrueinfinite`-adjacent globals — explicitly
  thread `&Context`.
- `ratconst.h` (594 lines of `inline const NUMBER init_*` literals) is the **seed data** for
  the Context constant table and the oracle's ground truth: transcribe every literal mantissa
  word exactly (they were generated upstream by `_dumprawrat`, support.cpp:578-611). The C++
  aggregate uses the MSVC flexible-array extension (ratpak.h:54-67, warning 4200 suppressed) —
  there is no struct-literal equivalent; hand-build each `Number { sign, exp, digits: vec![…] }`
  and a thin `read_constants()` mirroring `READRAWRAT/READRAWNUM` (support.cpp:45-49).

## 3. Strings / locale

- `std::wstring`/`wstring_view` → `String`/`&str` (UTF-8); **char-unit code that indexes
  strings by character positions** (CalcInput, `GetToken`, History token decoder,
  GroupDigits walks) ports to explicit `Vec<char>` or `char_indices()` loops — never
  byte-index arithmetic on `String`.
- `g_decimalSeparator` + engine separator/grouping members are populated from a
  **ResourceProvider trait** (see §6) exactly as `SettingsChanged` does (calc.cpp:157-199);
  there is **no** other ambient locale read in the engine (verified: scidisp.cpp:349 note,
  no GetLocaleInfo call). The engine stays locale-agnostic.
- `std::to_wstring`, stream formatting (`fixed`/`scientific`/`precision`) → Rust `format!`
  equivalents; **rounding difference** between C++ iostreams (implementation-defined, MSVC
  = round-half-even) and Rust `format!` (round-half-even) — record per-use in tests
  (NumberFormattingUtils rounding parity is on property tests).
- `stod`/`wcstol` in UnitConverter parse paths → `str::parse::<f64>/<i64>`; differing
  acceptance of `"0x.."`, whitespace, partial-parse semantics must be checked per call site
  (UnitConverter.cpp:254, 269, 624, 664, 704, 885). If SOURCE accepts a prefix, port the prefix rule.
- `wcstoul` scanner in `DigitGroupingStringToGroupingVector` (scidisp.cpp:223-241) is an
  incremental partial-parse with explicit next-pointer advance, sign acceptance (a `-1`
  group wraps to huge unsigned and is dropped by the `< MAX_GROUPING_SIZE` filter), and
  overflow clamping — port the scanner loop literally, not `str::parse`.
- `iswdigit` (scidisp.cpp:180) → ASCII digit check (`c.is_ascii_digit()`); the C-locale
  domain is ASCII-only in every reachable path.
- `GetNumberDigitsWholeNumberPart` (NumberFormattingUtils.cpp:51-54): the f64→u32 cast is
  `1.0 + max(0.0, log10(|v|))`, mathematically ≤ 310 for all reachable doubles — port as
  `debug_assert!(res.is_finite() && res >= 0.0 && res <= u32::MAX as f64); res as u32` with
  a `// SOURCE: unconditional cast, guarded by the max(0.0,·) domain` comment.

**Number-formatting exact-recipe rules (u01 BLOCKERS — these strings are user-visible and
asserted by UnitConverterTest golden values):**
- SOURCE `RoundSignificantDigits(value, n)` (NumberFormattingUtils.cpp:61-68) is **NOT**
  significant-digit rounding: with `out << fixed; out.precision(n)` it formats **n digits
  after the decimal point** (fixed-point rounding). Implement Rust as fixed-with-n-fraction
  formatting (Rust's Display rounding is round-half-even, matching MSVC's default FP rounding
  mode); never implement literal significant-digit rounding at that call name.
- SOURCE `ToScientificNumber(double)` (cpp:74-79) emits MSVC `scientific`: mantissa from the
  stream's default precision (6 digits after the point), exponent always signed and
  **zero-padded to a minimum of TWO digits** (C++11/U CRT iostreams; verified by the golden
  literals CalculatorManagerTest.cpp:1061-1075: `e+03`, `e-09`, `e+12` — three digits occur
  naturally for |exp| ≥ 100). Rust recipe: `format!("{number:.6e}")`, then re-render the
  exponent as `e±NN` (zero-pad to 2 min, always sign) and assert against the C++ golden
  strings from UnitConverterTest.

## 4. Error model map (CalcErr.h + engine)

- SOURCE mechanism: `throw <uint32_t CALC_E_*>` values caught as `catch(uint32_t)`.
  **Rust: no exceptions.** Ratpak call chain becomes `Result<T, CalcError>` with:
  ```rust
  #[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error)]
  pub enum CalcError {
      #[error("divide by zero")] DivideByZero,
      #[error("domain")] Domain,
      #[error("indefinite")] Indefinite,
      #[error("pos infinity")] PosInfinity,
      #[error("neg infinity")] NegInfinity,
      #[error("invalid range")] InvalidRange,
      #[error("out of memory")] OutOfMemory,
      #[error("overflow")] Overflow,
      #[error("no result")] NoResult,
      #[error("history bounds")] EBounds, // History.cpp:20 throw as int
  }
  ```
  Codes are the C++ HRESULT/SCODE-style 32-bit values (CalcErr.h:13-87; consumed via the
  `SCODE_CODE = code & 0xFFFF` mask at winerror_cross_platform.h:23) — keep them as
  `#[repr(i32)]` consts in a `pub mod code` next to the enum (interop parity, IDL alignment).
- **error-code → display-string contract** (u02): `DisplayError` resolves strings via
  `IDS_ERRORS_FIRST + SCODE_CODE(nError)` → engine-string table key (scifunc.cpp:298;
  IDS_ERRORS_FIRST = 99, EngineStrings.h:24-37). Add to `CalcError`:
  `pub fn resource_key(self) -> String` implementing exactly that arithmetic; keys outside
  the numeric scheme are the settings trio `"sDecimal"/"sThousand"/"sGrouping"`.
- **EngineStrings loading rules** (u02): seed from `g_sids` (152 entries, EngineStrings.h:209-362);
  insert **only non-empty** provider results (calc.cpp:31-38 skip-empty); numeric keys
  (decimal strings of IDs) and SIDS literal keys are the SAME keyspace preserved verbatim;
  reads on a missing key yield EMPTY STRING (C++ `unordered_map::operator[]` inserts an empty
  entry on miss, CalcEngine.h:98-105) — NOT an error, NOT `Option`; the `SettingsChanged`
  path overwrites key `"4"` (SIDS_DECIMAL_SEPARATOR) in the same map (calc.cpp:189).
- **Behavior-preservation map** (from engine walks — these are contract, not style):
  - ratpak internal `_`-functions: propagate `Result` upward, no catch.
  - Every `Rational`/`RationalMath` operator (the `catch → free → rethrow` blocks, Rational.cpp:105+):
    in Rust the interleaving disappears — `Result` propagates; the C++ free-then-rethrow
    has no Rust analog (ownership does it). Document in review checklist.
  - Engine `DoOperation` catch → `DisplayError(code)` + *return original lhs* (scioper.cpp:166-172)
    → Rust: `match do_swap(...) { Err(e) => { self.display_error(e); old_lhs } }`.
  - `SciCalcFunctions` catch (scifunc.cpp:284-288): same shape.
  - Trig domain guard sets state to 0 *and* errors (scicomm.cpp:373-381): port literally.
  - Error state machine (`m_bError`, HandleErrorCommand rollback of `m_nTempCom`,
    scicomm.cpp:65-72): port exactly; it is the UI's lockout contract.
  - `StringToNumber`/`StringToRat` return `nullptr` for bad input (non-throwing);
    → Rust `Option<Number>`/`Option<Rational>`, NOT Result (C++ contract is absence, not error).
  - `CalculatorVector` ResultCode API (unused class): port as fallible methods returning
    `Result<_, CalcError::EBounds>` for the RemoveAtEnd UB — see LESSONS (found-in-source).
    Note for reviewers: `SetAt` (CalculatorVector.h:36-47) *has* a try/catch for
    `std::out_of_range`, but it is provably dead (`vector::operator[]` throws nothing — the
    OOB write is UB). Porting it to E_BOUNDS is the recorded decision, not an erased handler.
  - `powrat`'s internal catch-all fallback (`try powratNumeratorDenominator catch → powratcomp`,
    exp.cpp:292-302) → Rust two-stage strategy with a local `Result` match, not error
    propagation — the *only* place where swallowing `Err` is correct in the port. Verified
    safe to port this way: `powratNumeratorDenominator` writes `*px` only at its end
    (exp.cpp:378-392), so the fallback sees the original value.

## 5. Banned constructs (port-level)

- `unwrap()`/`expect()` outside `#[cfg(test)]`.
- `as` casts for `f64 → i64/u64` or `usize → u32` (use `TryFrom` + boundary behavior from SOURCE).
- Panicking indexing (`x[i]`) where C++ relied on UB or swallowed exceptions: `RemoveAtEnd`
  on empty (CalculatorVector.h:103-107), `SetAt` without bounds (h:36-47) → explicit
  `Result` error, recorded in LESSONS as behavior *specification* (C++ was UB → owner picks
  the Err branch; recorded default: E_BOUNDS).
- Panic-index where C++ was guaranteed in-range: use `get_mut().expect("invariant: …")`
  only with the invariant named from SOURCE line — reviewers check.
- `Box<dyn Any>` as error carrier, `String` as error value, TODO/placeholder constants.
- `unsafe` anywhere in the workspace (target = 0 unsafe; BASEX arena is gone with the type map).
- Mutable globals à la C++ (see §7 mapping policy) — the *only* `static`s allowed are `OnceLock`
  for read-only tables (operatorStringTable, g_sids, DIGITS).

**Sanctioned non-test `expect` (4th case, pilot gate 2026-10-23):** structural expects over
Rust `format!`/parser invariants are allowed where the C++ analog has NO failure path and
the doc comment names the SOURCE basis (golden literals or invariant line) — reviewers check
the doc, not the call. This does NOT license general `unwrap`, nor expects over data that
can plausibly be malformed at runtime.

## 6. Interface seams (C++ → Rust traits, verbatim surface)

**Command ID spaces (u02 BLOCKER):** SOURCE has FOUR overlapping numeric spaces — engine
opcodes `IDC_*` (0..763, CCommand.h), UI `Command` enum (overlapping values, e.g.
`CommandDIV = 91`, Command.h:61+), `UnitConversionManager::Command`/`Currency…Command`
(Command.h:8-49), `MemoryCommand` (CalculatorManager.h:34-42, itself dead code per walk).
Dispatch works ONLY because `static_cast<OpCode>(command)` preserves the numerals
(CalculatorManager.cpp:235, 250-306). Port each space as concrete named constants keyed to
the SOURCE numerals; define the Command→OpCode conversion explicitly; state in tests that
value equality across spaces is load-bearing behavior.

| SOURCE interface | Rust | Consumers to satisfy |
|---|---|---|
| `ICalcDisplay` (11 methods, ICalcDisplay.h:9-25) | `pub trait ICalcDisplay { ... }` object-safe; engine holds `Arc<Mutex<dyn ICalcDisplay>>` non-optional (mgr always provides) | **Global rule: the engine NEVER null-checks the display** — SOURCE's one missing guard (scicomm.cpp:566-569) has a twin at History.cpp:295 (`OnHistoryItemAdded`); port both call paths unconditionally and LESSONS records the pair | CalendarManager forwards to React via Tauri events later |
| `IHistoryDisplay` (IHistoryDisplay.h:9-17) | same pattern (`Arc<Mutex<dyn IHistoryDisplay>>`); NOTE: programmer mode passes null (CalculatorManager.cpp:196-208) → Rust uses `Option<…>` here only | u08 |
| `IResourceProvider` (CalculatorResource.h:10-25) | `pub trait IResourceProvider { fn get_cengine_string(&self, id: &str) -> String; }` — **2-reviewer gate decision (pilot u01/u02, 2026-10-23): TOTAL function, `String`, not `Option`**; miss-empty semantics belong to the engine string map (§4 `operator[]` rule) and the `.`/`,`/`"3;0"` fallbacks (EngineResourceProvider.cs:55-58) stay OUT of the engine | u02 knob |
| `IConverterDataLoader` / `ICurrencyConverterDataLoader` (UnitConverter.h:177-201) | sync traits (`fn load_ordered_ratios(...)`) — the C++ PPL `task<T>` choreography is not an engine contract post-decision; the *UI-layer networking* stays outside the engine. Logged in Plan divergence table. | u09 |
| `IViewModelCallback` equivalents | fold into `ICalcDisplay`-style VM callback trait (`unit_conv::VmCallback`) | u09 |

## 7. Ambient / process-wide state policy (this is the conversion hub)

C++ had *five* process-wide mutable clusters; the Rust target keeps them as **explicit
context objects owned above the units** (no C++-style unreachable globals):

| SOURCE global | Rust home | Notes |
|---|---|---|
| ratpak constant table (`num_*`/`rat_*` ~40 heap consts, support.cpp:78-118) | `struct RatGlobals` field bundle inside `Context`, re-derived by `change_constants(&mut Context, radix, precision)` (support.cpp:133-280 logic 1:1) | C++ nullables+rebuild → Rust fields built during `change_constants`; seed data from `ratconst.h` transcribed exactly (§2 macro sub-rules). The two-line duplicate init at support.cpp:160-161 initializes **rat_word twice** (the dead second line was upstream's `rat_byte`); `rat_byte` is created only in the else/`_readconstants` path (support.cpp:641-642) — with defaults the gate is exactly equal, so the else branch runs FIRST at startup and `rat_byte` does get initialized. Port preserves this branch ordering |
| `g_ratio`, `g_ftrueinfinite`, `cbitsofprecision` | same `Context` fields | gate at support.cpp:145 uses `cbitsofprecision < g_ratio*radix*precision`; `g_ratio` write is `ceil(31/log2(radix)) - 1` via `<cmath>` (support.cpp:139) — **the log2 result must be pinned**: add a `g_ratio` equality test over radix 2..16 (a 1-ulp log2 wobble flips the gate branch — DEPENDENCIES row for `<cmath>`) |
| `g_decimalSeparator` (conv.cpp:37) | parameter `sep: char` carried on `Context` too (single source) | SetDecimalSeparator is called from **SettingsChanged** (calc.cpp:157-199), i.e. at ctor AND on every settings change — a port that sets it once at startup diverges mid-session |
| `CCalcEngine::s_engineStrings` static (calc.cpp:27, CalcEngine.h:165) | `Arc<RwLock<HashMap<String, String>>>` owned by CalculatorManager, shared to engines (rules in §4 bullet) | |
| `gldPrevious` display cache (scidisp.cpp:39-51) | shared `Arc<Mutex<LastDisp>>` created by CalculatorManager and passed to all THREE engines (C++ shared it process-wide across standard/sci/programmer instances; per-engine copies would silently change behavior) | |
| `quoteConversions`/`unquoteConversions` (UnitConverter.cpp:31-32, built in ctor) | `UnitConverter` struct fields (they were "global but rebuilt per ctor" — Rust struct field is the faithful home) | |
| `statestr[]` debug table (conv.cpp:559-563) | not ported (dead, debug-only) | LESSONS #12 |

**Construction-order invariant (BLOCKER for u05/u06):** the C++ engine ctor reads ratpak
globals (`InitChopNumbers` → `rat_qword/dword/word/byte`, calc.cpp:102, 118-121) and is only
safe because CalculatorManager's ctor ran `InitialOneTimeOnlySetup → ChangeConstants`
first (CalculatorManager.cpp:32 → calc.cpp:46-53). Mirror that ordering: **the Context is
constructed with `change_constants` eagerly applied before any engine is built**, and reads
of post-init Context constant fields may use
`expect("invariant: InitialOneTimeOnlySetup ran first")` under §5's named-invariant clause.

## 8. Precision & constant-policy notes (REQUIRED reading before touching ratpak)

- `Rational`-class ops are *pinned* to precision 128 (`RATIONAL_PRECISION`, Rational.h:15) —
  NOT the engine display precision (32). Port the constant exactly; do not plumb m_precision in.
- **Rational/RationalMath methods DO receive `&Context`** (for the constant table,
  `g_ftrueinfinite`, `g_ratio` — ratpak internals like `trimit` read them, support.cpp:680-684);
  what they pass *as the precision argument* into ratpak is the pinned 128, never engine
  state. Same seam applies to ctor-time context reads (e.g. `m_maxTrigonometricNum =
  RationalMath::Pow(10, 100)`, calc.cpp:106).
- Engine radix/precision changes flow: `ChangeBaseConstants` (sciset.cpp:166-180) →
  `change_constants` (context). The `cbitsofprecision >= g_ratio*radix*precision` gate rules
  whether constants *recompute* → preserve the else-branch literal copy path (support.cpp:271-279).
- `MAX_LONG_SIZE=33`, `MAX_ZEROS_AFTER_DECIMAL=2`, factorial ±domain (3249/−1000),
  exp domain ±100000: constants, not magic — port as `pub const`.
- Rounding sites (verified): `NumberToString` adds half-of-output-radix at last kept digit
  (round-half-up in sign direction, conv.cpp:1099-1117); `intrat` truncates toward 0
  (support.cpp:293-313); `powratNumeratorDenominator` rounds ±0.5 directionally
  (exp.cpp:355-363). **Do not** "unify" these in a helper — they are different algorithms.

## 9. Test placement & oracle mapping

- Rust tests live in TWO places, by origin: **(a) translated C++ TEST_METHODs** go in the
  per-source integration file (`engine/tests/<cpp_name>.rs`, table below) — one file per C++
  test source, methods in SOURCE order, partial-port slices marked with a header stating the
  total/porting/remaining method counts; **(b) ADDITIVE shape/property tests** (no C++
  counterpart) live in-module as `#[cfg(test)] mod tests` with a
  `// ADDITIVE (not a C++ TEST_METHOD translation)` marker. Each C++ TEST_METHOD
  maps 1:1 to a Rust test with the mechanically-cased same human name — the mapping table
  is the oracle evidence.
- One relationship file per C++ test source: `engine/tests/<cpp_name>.rs` — RationalTest →
  `engine/tests/rational_test.rs`, CalcInputTest → `engine/tests/calc_input_test.rs`,
  CalcEngineTests → `engine/tests/calc_engine_tests.rs`, CalculatorManagerTest →
  `engine/tests/calculator_manager_test.rs`, UnitConverterTest → `engine/tests/unit_converter_test.rs`.
- Translated assertion values are **exact literals** (verbatim from C++ source line); no
  re-derivation in Rust, no reformatted truthiness.
- Property tests (PLAN criterion 3) live in `engine/tests/property/` and are additive-only.

## 10. Divergence checklist extensions (Rust-specific, from this codebase)

Every reviewer must additionally check (per-unit):
1. `wrapping_` uses match the SOURCE overflow sites (§1 rules), no over-/under-application.
2. `Rational` deep-copy sites that C++ had as "hand-written copy of PRAT": cloned everywhere
   C++ copies; moved only where C++ destroyed the source (swap/steal patterns list:
   rat.cpp:259-260, num.cpp:338-339, basex.cpp:321-322, trans.cpp:208-221).
3. Sign-toggle of borrowed operand (`_subrat`, compare fns; rat.cpp:203-205,
   support.cpp:359-361...) implemented on a **clone**, then merged — because C++ toggled the
   caller's object; Rust must reproduce the *net effect* (compare equal then restore).
4. `modrat(BASEX as precision)` oddity (logic.cpp:249) — port the parameter value literally
   and note it (do not "fix" to a good precision).
5. `atanhrat` lacks the radix parameter (ratpak.h:400) — port signature asymmetry as-is.
6. `m_holdVal`/`m_carryBit`/paren-arrays "C does not clear it" semantics (scicomm.cpp:434-461)
   — unit tests MUST cover the C-does-not-clean behavior for these three.
7. The 84-char input cap, 100-memory-slot cap, 20-history cap, 15-digit converter cap:
   caps are *behavior*, port as consts and assert them in tests.
8. `unordered_map<Unit,…>` with `UnitHash{id}` — Rust `HashMap<Unit,…>` with a custom
   `Hash`/`PartialEq` on `id` only (UnitConverter.h:64-67, 110-117). Full fidelity: two
   distinct Units with same id but different names collide in C++ too — preserve.
