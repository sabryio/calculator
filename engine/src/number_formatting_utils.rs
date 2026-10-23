// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// SOURCE: src/CalcManager/NumberFormattingUtils.cpp + .h
// (namespace UnitConversionManager::NumberFormattingUtils)
//
// Behavior-preserving port. String policy per migration/PORTING.md §3: SOURCE
// `std::wstring` (UTF-16) → UTF-8 `String`; every reachable input in the SOURCE
// (unit-converter numbers) is ASCII, asserted by the translated oracle tests.
// Rounding rules per PORTING §3: MSVC C++11 iostreams and Rust `format!` both
// round half-to-even; the golden assertions below pin the exact behavior.

/// Trims out any trailing zeros or decimals in the given input string.
pub fn trim_trailing_zeros(number: &mut String) {
    if number.find('.').is_none() {
        return;
    }

    // SOURCE: `find_last_not_of(L'0')`; erase everything AFTER the last non-'0'.
    // (npos when the string is all '0's is unreachable here: the '.' above
    // guarantees at least one non-'0' character.)
    if let Some((i, c)) = number.char_indices().rfind(|&(_, c)| c != '0') {
        number.truncate(i + c.len_utf8());
    }

    if number.ends_with('.') {
        number.pop();
    }
}

/// Get number of digits (whole number part + decimal part)
///
/// # Panics
///
/// Panics only if the digit count exceeds `u32::MAX` — unreachable in the SOURCE
/// domain (strings are capped at 84 characters by `CalcInput MAX_STRLEN`).
#[must_use]
pub fn get_number_digits(value: &str) -> u32 {
    let mut value = value.to_string();
    trim_trailing_zeros(&mut value);
    // SOURCE: `static_cast<unsigned int>(value.size())`. TryFrom per PORTING §1
    // (no silent usize→u32 narrowing); strings are ASCII in every reachable engine
    // path (validated by this file's translated oracle tests), so a Rust code-point
    // count equals the C++ UTF-16 code-unit count. The SOURCE domain caps strings
    // at 84 characters (CalcInput MAX_STRLEN), so the count never approaches u32::MAX.
    let mut number_significant_digits = u32::try_from(value.chars().count())
        .expect("SOURCE input domain: digit counts fit u32 easily (string cap is 84 chars)");
    if value.contains('.') {
        number_significant_digits -= 1;
    }
    if value.contains('-') {
        number_significant_digits -= 1;
    }
    number_significant_digits
}

/// Get number of digits (whole number part only)
#[must_use]
#[allow(clippy::cast_possible_truncation, clippy::cast_sign_loss)]
pub fn get_number_digits_whole_number_part(value: f64) -> u32 {
    if value == 0.0 {
        1
    } else {
        // SOURCE: `static_cast<unsigned int>(1 + max(0.0, log10(abs(value))))`.
        // Unconditional cast guarded by the max(0.0, ·) domain (PORTING §3):
        // mathematically ≤ 310 for every reachable f64, so the cast cannot
        // saturate; debug_assert names the invariant instead of widening.
        let digits = 1.0 + 0.0_f64.max(value.abs().log10());
        debug_assert!(
            digits.is_finite() && digits >= 0.0 && digits <= f64::from(u32::MAX),
            "invariant from SOURCE domain: 1 + max(0.0, log10(|v|)) fits u32"
        );
        digits as u32
    }
}

/// Rounds the given double to the given number of significant digits.
///
/// SOURCE note (PORTING §3 blocker rule): despite the name, this is *fixed-point*
/// rounding to `number_significant_digits` digits AFTER the decimal point
/// (`out << fixed; out.precision(n)`), not significant-digit rounding.
#[must_use]
pub fn round_significant_digits(num: f64, number_significant_digits: u32) -> String {
    format!("{:.*}", number_significant_digits as usize, num)
}

/// Convert a Number to Scientific Notation.
///
/// SOURCE: `wstringstream out; out << scientific << number` with default precision
/// (6 digits after the mantissa point). MSVC C++11 iostreams emit the exponent
/// signed and zero-padded to a minimum of TWO digits — golden literals
/// CalculatorManagerTest.cpp:1058-1076 (`e+03`, `e-09`, `e+12`); three digits occur
/// naturally for |exp| ≥ 100. `NaN`/`inf` are unreachable in SOURCE usage paths.
///
/// # Panics
///
/// Panics only if the `format!("{:.6e}")` invariant breaks (exponent separator or
/// integer exponent missing) — structurally impossible for finite `f64` values.
#[must_use]
pub fn to_scientific_number(number: f64) -> String {
    let formatted = format!("{number:.6e}");
    let (mantissa, exponent) = formatted
        .split_once('e')
        .expect("SOURCE invariant: `{:e}` formatting always emits an exponent separator");
    let exponent_value: i32 = exponent
        .parse()
        .expect("SOURCE invariant: `{:e}` exponent is a signed decimal integer");
    let sign = if exponent_value < 0 { '-' } else { '+' };
    let digits = exponent_value.abs();
    format!("{mantissa}e{sign}{digits:02}")
}
