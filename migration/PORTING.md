# PORTING.md — idiom map, banned constructs, conventions, divergence rules

> **Status: PLACEHOLDER.** Step 3 will populate this; do not write Rust against a non-
> validated guide. Seed from `references/rust-porting.md` §3-§8 and walk the actual code.

## Content to be added in Step 3
- Type/integer-width map (explicit per-field, no silent narrowing).
- Error-handling map (`CalcErr.h`/WinError taxonomies → thiserror enum).
- Allocation/ownership rules for Ratpak mantissa buffers (`malloc/free` → Rust ownership;
  no global allocator bridging).
- Precision/scaling constant handling (`NUMCALCDIGITS`, `PRECTEST` etc.).
- Locale/ambient-data capture rules.
- Test placement & naming conventions; how oracle tests map to `#[test]`s.
- PORTING banned constructs (usage disallowed) — e.g. `usize`↔`u32` narrowing without TryFrom,
  `f64` for money/radix, `unwrap` outside tests.
