// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// ORACLE: src/CalculatorUnitTests/CalculatorManagerTest.cpp — verbatim translation
// per migration/ORACLE.md. Exact expected literals, identical input sequences.
//
// Ported slice (CalculatorManagerTest.cpp:978-1076): the five
// UnitConversionManagerNumberFormattingUtils_* TEST_METHODs (u01 pilot).
// The file holds 21 TEST_METHODs in total; 5 are ported here, **16 remain** and
// land with u08. DIRECTIVE FOR THE u08 PORT AGENT: extend THIS file with the
// remaining methods in SOURCE order — do not create a second CalculatorManagerTest
// file. Do not weaken anything below when they arrive.
#![allow(
    clippy::unreadable_literal, // literals are verbatim from the C++ oracle source
    clippy::excessive_precision, // extra digits are SOURCE-preserved f64-noise
    clippy::inconsistent_digit_grouping, // underscores follow VALUE grouping, clippy wants mantissa grouping
    clippy::similar_names
)]

use engine::number_formatting_utils::{
    get_number_digits, get_number_digits_whole_number_part, round_significant_digits,
    to_scientific_number, trim_trailing_zeros,
};

// TEST_METHOD(UnitConversionManagerNumberFormattingUtils_TrimTrailingZeros)
#[test]
fn unit_conversion_manager_number_formatting_utils_trim_trailing_zeros() {
    let mut number = String::from("2.1032100000000");
    trim_trailing_zeros(&mut number);
    assert_eq!(number, "2.10321");
    number = String::from("-122.123200");
    trim_trailing_zeros(&mut number);
    assert_eq!(number, "-122.1232");
    number = String::from("0.0001200");
    trim_trailing_zeros(&mut number);
    assert_eq!(number, "0.00012");
    number = String::from("12.000");
    trim_trailing_zeros(&mut number);
    assert_eq!(number, "12");
    number = String::from("-12.00000");
    trim_trailing_zeros(&mut number);
    assert_eq!(number, "-12");
    number = String::from("0.000");
    trim_trailing_zeros(&mut number);
    assert_eq!(number, "0");
    number = String::from("322423");
    trim_trailing_zeros(&mut number);
    assert_eq!(number, "322423");
}

// TEST_METHOD(UnitConversionManagerNumberFormattingUtils_GetNumberDigits)
#[test]
fn unit_conversion_manager_number_formatting_utils_get_number_digits() {
    let mut number = "2.10321";
    let mut digits_count = get_number_digits(number);
    assert_eq!(digits_count, 6);
    number = "-122.1232";
    digits_count = get_number_digits(number);
    assert_eq!(digits_count, 7);
    number = "-3432";
    digits_count = get_number_digits(number);
    assert_eq!(digits_count, 4);
    number = "0";
    digits_count = get_number_digits(number);
    assert_eq!(digits_count, 1);
    number = "0.0001223";
    digits_count = get_number_digits(number);
    assert_eq!(digits_count, 8);
}

// TEST_METHOD(UnitConversionManagerNumberFormattingUtils_GetNumberDigitsWholeNumberPart)
#[test]
fn unit_conversion_manager_number_formatting_utils_get_number_digits_whole_number_part() {
    let mut digits_count = get_number_digits_whole_number_part(2.10321);
    assert_eq!(digits_count, 1);
    digits_count = get_number_digits_whole_number_part(-122.1232);
    assert_eq!(digits_count, 3);
    digits_count = get_number_digits_whole_number_part(-3432.0);
    assert_eq!(digits_count, 4);
    digits_count = get_number_digits_whole_number_part(0.0);
    assert_eq!(digits_count, 1);
    digits_count = get_number_digits_whole_number_part(324328412837382.0);
    assert_eq!(digits_count, 15);
    digits_count = get_number_digits_whole_number_part(324328412837382.232_213_214_324_234);
    assert_eq!(digits_count, 15);
    digits_count = get_number_digits_whole_number_part(0.032);
    assert_eq!(digits_count, 1);
    digits_count = get_number_digits_whole_number_part(0.000_000_000_000_000_000_01);
    assert_eq!(digits_count, 1);
}

// TEST_METHOD(UnitConversionManagerNumberFormattingUtils_RoundSignificantDigits)
#[test]
fn unit_conversion_manager_number_formatting_utils_round_significant_digits() {
    let mut result = round_significant_digits(12.342_343_242, 3);
    assert_eq!(result, "12.342");
    result = round_significant_digits(12.342_999_9, 3);
    assert_eq!(result, "12.343");
    result = round_significant_digits(12.342_500_001, 3);
    assert_eq!(result, "12.343");
    result = round_significant_digits(-2312.124_424_334_645_434_5, 5);
    assert_eq!(result, "-2312.12442");
    result = round_significant_digits(0.342_343_242_3, 5);
    assert_eq!(result, "0.34234");
    result = round_significant_digits(0.3423, 7);
    assert_eq!(result, "0.3423000");
}

// TEST_METHOD(UnitConversionManagerNumberFormattingUtils_ToScientificNumber)
#[test]
fn unit_conversion_manager_number_formatting_utils_to_scientific_number() {
    let mut result = to_scientific_number(3423.0);
    assert_eq!(result, "3.423000e+03");
    result = to_scientific_number(-21.0);
    assert_eq!(result, "-2.100000e+01");
    result = to_scientific_number(0.0232);
    assert_eq!(result, "2.320000e-02");
    result = to_scientific_number(-0.00921);
    assert_eq!(result, "-9.210000e-03");
    result = to_scientific_number(2343243345677.0);
    assert_eq!(result, "2.343243e+12");
    result = to_scientific_number(-3432474247332942.0);
    assert_eq!(result, "-3.432474e+15");
    result = to_scientific_number(0.000_000_003_432_432);
    assert_eq!(result, "3.432432e-09");
    result = to_scientific_number(-0.000_000_003_432_432);
    assert_eq!(result, "-3.432432e-09");
}
