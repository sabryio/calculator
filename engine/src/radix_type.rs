// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// SOURCE: src/CalcManager/Header Files/RadixType.h
//
// This is expected to be in same order as IDM_HEX, IDM_DEC, IDM_OCT, IDM_BIN
// (variant order is load-bearing: COrdinalToRadixType-style index arithmetic relies
// on it; consume via exhaustive match, not casts — the port keeps the enum opaque).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum RadixType {
    Hex,
    Decimal,
    Octal,
    Binary,
}
