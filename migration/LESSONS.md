# LESSONS.md — append-only learning log

> Anyone may append. Additions describe *classes* of failure, not single instances.
> Under "Found in source": record every source-code bug discovered; preserve behavior unless
> the owner decides otherwise (behavior-preservation principle).

## Found in source
(facts discovered by the Step-3 walks; behavior PRESERVED in the port unless owner decides
otherwise — raising any of these requires a human call, not a port-time fix)
1. `i32tonum` negates INT32_MIN unsafely — conv.cpp:815-819 (`ini32 *= -1` on arbitrary input;
   reachable only if callers pass INT32_MIN; `ratpowi32` (conv.cpp:1500-1526) explicitly
   routes around this "so INT32_MIN never needs to be negated as an int32_t").
2. `rat_byte` init quirk — support.cpp:160-161 duplicate `INIT_AND_DUMP_RAW_RAT_IF_NULL(rat_word,...)`
   (second line upstream targeted `rat_byte`); with defaults, gate equality makes the else
   branch run first, so `rat_byte` is still initialized via the `READRAWRAT` path only
   (support.cpp:641-642). Port must preserve which branch runs first.
3. `modrat(X, 0)` returns X deliberately, and `modrat` passes **BASEX** as the precision arg
   (logic.cpp:249) — parameter is effectively unused/odd; preserved verbatim.
4. `CalculatorVector::RemoveAtEnd` is UB on empty container (`erase(--end())`,
   CalculatorVector.h:103-107) and `SetAt` is not bounds-checked (h:36-47).
5. `gcd`/`gcdrat` unreachable in practice: every call site gated on MULGCD/DIVGCD/ADDGCD
   which no build defines (rat.cpp:117,167,268). Also `i32factnum` "not currently used"
   (conv.cpp:1400), `num_five/num_six/rat_neg_one` entries no consumer, `_acosrat` unused
   (itrans.cpp:162).
6. `atanhrat` is the only trig/hyp fn without a radix parameter (ratpak.h:400).
7. `CCalcEngine`'s `OnNoRightParenAdded` calls the display callback without the null check
   used at every other call site (scicomm.cpp:566-569); twin site at History.cpp:295
   (`m_pCalcDisplay->OnHistoryItemAdded`). PORTING rule: the engine never null-checks the
   display, globally — not per-site cherry-picking.
8. `m_holdVal` is NOT cleared by IDC_CLEAR (scicomm.cpp:434-461) — deliberate replication
   target; likewise `m_carryBit` survives until C (scicomm.cpp:449) and paren/precedence
   array contents persist after C.
9. `gldPrevious` display cache + `s_engineStrings` are PROCESS-wide, shared across all
   three engine instances (scidisp.cpp:39-51; calc.cpp:27, CalcEngine.h:165).
10. `rattoUi32` reinterprets signed digits intentionally ("This happens to work even if it is
    only signed", conv.cpp:934, function at conv.cpp:919-939).</think><tool_call>edit<arg_key>newString</arg_key><arg_value>10. `rattoUi32` reinterprets signed digits intentionally ("This happens to work even if it is
    only signed", conv.cpp:934; function conv.cpp:919-939; note `rattoUi64` at 956ff is a
    separate 64-bit path).
11. `i32factnum` unused; `statestr[]` debug-only table dead (conv.cpp:559-563).
13. History `Truncate` throws raw int E_BOUNDS (0x8000000B) as an exception (History.cpp:20).

## Standing rules added
1. (2026-10-23) Any construct not in PORTING.md → STOP the unit, patch the guide, resume.
2. (2026-10-23) C++ UB never becomes Rust UB: where SOURCE UB exists, port to an explicit
   `Result<_, CalcError::EBounds>` (or the sign-directed alternative the SOURCE comments
   imply), and record the spot here. UB is a behavior *category*, and it picks the branch the
   SOURCE comments/state machine implies — never panic-in-release.
3. (2026-10-23) Process-wide C++ statics become explicit context objects owned above the
   units (PORTING.md §7); no new global mutable state in Rust.
4. (2026-10-23) PILOT CORRECTION — the Step-3 reviewers' claim that MSVC `scientific`
   prints 3-digit exponents (`e+023`) is WRONG: the oracle golden literals
   (CalculatorManagerTest.cpp:1061-1075: `e+03`, `e-09`, `e+12`) prove minimum-2-digit
   zero-padding (C++11/U CRT iostreams; 3 digits naturally at |exp| ≥ 100). PORTING §3
   re-verified and patched. Lesson: a file:line citation is not proof of behavior — golden
   literals are. Any future format-behavior rule must cite executable evidence, not a
   reviewer's recollection.
5. (2026-10-23) `IResourceProvider` port shape decided at the pilot gate: trait returns a
   total `String` per the C++ total-function contract; miss-empty semantics stay a
   property of the engine string map (PORTING §4), provider fallbacks stay out of the
   engine. Recorded in PORTING §6; later units must not reintroduce `Option<String>`.
