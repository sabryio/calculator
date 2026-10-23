// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// SOURCE: src/CalcManager/Command.h
//
// Command ID spaces rule: migration/PORTING.md §6. The three C++ namespaces are
// separate ID SPACES with overlapping numerals; dispatch between them works only
// because `static_cast<OpCode>(command)` preserves the numerals. Each command
// identifier keeps its SOURCE name (mechanically cased per PORTING §0); value
// equality across spaces is load-bearing behavior (additive tests below pin the
// facts that exist inside THIS unit; the cross-space OpCode conversion is
// asserted when the IDC_* space ports with u06).
#![allow(non_upper_case_globals)]

pub mod calculation_manager {
    /// `CalculationManager::Command` in SOURCE is an `enum class : int` whose values
    /// overlap, skip (hole 85), and even duplicate (`CommandNot` 101 == `CommandCOM` 101).
    /// A Rust enum cannot represent duplicate discriminants cleanly, and the engine
    /// treats these as numerals (`static_cast<OpCode>` at CalculatorManager.cpp:235,
    /// 250-306). Port: type alias + constants keyed to the SOURCE numerals.
    pub type Command = i32; // SOURCE underlying type: int

    // SOURCE: MODE Constants region — Commands for programmer calculators are omitted.
    pub const CommandDEG: Command = 321;
    pub const CommandRAD: Command = 322;
    pub const CommandGRAD: Command = 323;
    pub const CommandDegrees: Command = 324;
    pub const CommandHYP: Command = 325;

    pub const CommandNULL: Command = 0;

    pub const CommandSIGN: Command = 80;
    pub const CommandCLEAR: Command = 81;
    pub const CommandCENTR: Command = 82;
    pub const CommandBACK: Command = 83;

    pub const CommandPNT: Command = 84;

    // Hole  85
    // Unused commands defined in Command.h is omitted.
    pub const CommandXor: Command = 88;
    pub const CommandLSHF: Command = 89;
    pub const CommandRSHF: Command = 90;
    pub const CommandDIV: Command = 91;
    pub const CommandMUL: Command = 92;
    pub const CommandADD: Command = 93;
    pub const CommandSUB: Command = 94;
    pub const CommandMOD: Command = 95;
    pub const CommandROOT: Command = 96;
    pub const CommandPWR: Command = 97;

    pub const CommandCHOP: Command = 98; // Unary operators must be between CommandCHOP and CommandEQU
    pub const CommandROL: Command = 99;
    pub const CommandROR: Command = 100;
    pub const CommandCOM: Command = 101;

    pub const CommandSIN: Command = 102;
    pub const CommandCOS: Command = 103;
    pub const CommandTAN: Command = 104;

    pub const CommandSINH: Command = 105;
    pub const CommandCOSH: Command = 106;
    pub const CommandTANH: Command = 107;

    pub const CommandLN: Command = 108;
    pub const CommandLOG: Command = 109;
    pub const CommandSQRT: Command = 110;
    pub const CommandSQR: Command = 111;
    pub const CommandCUB: Command = 112;
    pub const CommandFAC: Command = 113;
    pub const CommandREC: Command = 114;
    pub const CommandDMS: Command = 115;
    pub const CommandCUBEROOT: Command = 116; // x ^ 1/3
    pub const CommandPOW10: Command = 117; // 10 ^ x
    pub const CommandPERCENT: Command = 118;

    pub const CommandFE: Command = 119;
    pub const CommandPI: Command = 120;
    pub const CommandEQU: Command = 121;

    pub const CommandMCLEAR: Command = 122;
    pub const CommandRECALL: Command = 123;
    pub const CommandSTORE: Command = 124;
    pub const CommandMPLUS: Command = 125;
    pub const CommandMMINUS: Command = 126;

    pub const CommandEXP: Command = 127;

    pub const CommandOPENP: Command = 128;
    pub const CommandCLOSEP: Command = 129;

    // The controls for 0 through F must be consecutive and in order
    pub const Command0: Command = 130;
    pub const Command1: Command = 131;
    pub const Command2: Command = 132;
    pub const Command3: Command = 133;
    pub const Command4: Command = 134;
    pub const Command5: Command = 135;
    pub const Command6: Command = 136;
    pub const Command7: Command = 137;
    pub const Command8: Command = 138;
    pub const Command9: Command = 139;
    pub const CommandA: Command = 140;
    pub const CommandB: Command = 141;
    pub const CommandC: Command = 142;
    pub const CommandD: Command = 143;
    pub const CommandE: Command = 144;
    // this is last control ID which must match the string table
    pub const CommandF: Command = 145;
    pub const CommandINV: Command = 146;
    pub const CommandSET_RESULT: Command = 147;

    pub const CommandSEC: Command = 400;
    pub const CommandASEC: Command = 401;
    pub const CommandCSC: Command = 402;
    pub const CommandACSC: Command = 403;
    pub const CommandCOT: Command = 404;
    pub const CommandACOT: Command = 405;

    pub const CommandSECH: Command = 406;
    pub const CommandASECH: Command = 407;
    pub const CommandCSCH: Command = 408;
    pub const CommandACSCH: Command = 409;
    pub const CommandCOTH: Command = 410;
    pub const CommandACOTH: Command = 411;

    // 2 ^ x
    pub const CommandPOW2: Command = 412;
    pub const CommandAbs: Command = 413;
    pub const CommandFloor: Command = 414;
    pub const CommandCeil: Command = 415;
    pub const CommandROLC: Command = 416;
    pub const CommandRORC: Command = 417;
    pub const CommandLogBaseY: Command = 500;
    pub const CommandNand: Command = 501;
    pub const CommandNor: Command = 502;

    pub const CommandRSHFL: Command = 505;
    pub const CommandRand: Command = 600;
    pub const CommandEuler: Command = 601;

    pub const CommandAnd: Command = 86;
    pub const CommandOR: Command = 87;
    pub const CommandNot: Command = 101;

    pub const ModeBasic: Command = 200;
    pub const ModeScientific: Command = 201;

    pub const CommandASIN: Command = 202;
    pub const CommandACOS: Command = 203;
    pub const CommandATAN: Command = 204;
    pub const CommandPOWE: Command = 205;
    pub const CommandASINH: Command = 206;
    pub const CommandACOSH: Command = 207;
    pub const CommandATANH: Command = 208;

    pub const ModeProgrammer: Command = 209;
    pub const CommandHex: Command = 313;
    pub const CommandDec: Command = 314;
    pub const CommandOct: Command = 315;
    pub const CommandBin: Command = 316;
    pub const CommandQword: Command = 317;
    pub const CommandDword: Command = 318;
    pub const CommandWord: Command = 319;
    pub const CommandByte: Command = 320;

    pub const CommandBINEDITSTART: Command = 700;
    pub const CommandBINPOS0: Command = 700;
    pub const CommandBINPOS1: Command = 701;
    pub const CommandBINPOS2: Command = 702;
    pub const CommandBINPOS3: Command = 703;
    pub const CommandBINPOS4: Command = 704;
    pub const CommandBINPOS5: Command = 705;
    pub const CommandBINPOS6: Command = 706;
    pub const CommandBINPOS7: Command = 707;
    pub const CommandBINPOS8: Command = 708;
    pub const CommandBINPOS9: Command = 709;
    pub const CommandBINPOS10: Command = 710;
    pub const CommandBINPOS11: Command = 711;
    pub const CommandBINPOS12: Command = 712;
    pub const CommandBINPOS13: Command = 713;
    pub const CommandBINPOS14: Command = 714;
    pub const CommandBINPOS15: Command = 715;
    pub const CommandBINPOS16: Command = 716;
    pub const CommandBINPOS17: Command = 717;
    pub const CommandBINPOS18: Command = 718;
    pub const CommandBINPOS19: Command = 719;
    pub const CommandBINPOS20: Command = 720;
    pub const CommandBINPOS21: Command = 721;
    pub const CommandBINPOS22: Command = 722;
    pub const CommandBINPOS23: Command = 723;
    pub const CommandBINPOS24: Command = 724;
    pub const CommandBINPOS25: Command = 725;
    pub const CommandBINPOS26: Command = 726;
    pub const CommandBINPOS27: Command = 727;
    pub const CommandBINPOS28: Command = 728;
    pub const CommandBINPOS29: Command = 729;
    pub const CommandBINPOS30: Command = 730;
    pub const CommandBINPOS31: Command = 731;
    pub const CommandBINPOS32: Command = 732;
    pub const CommandBINPOS33: Command = 733;
    pub const CommandBINPOS34: Command = 734;
    pub const CommandBINPOS35: Command = 735;
    pub const CommandBINPOS36: Command = 736;
    pub const CommandBINPOS37: Command = 737;
    pub const CommandBINPOS38: Command = 738;
    pub const CommandBINPOS39: Command = 739;
    pub const CommandBINPOS40: Command = 740;
    pub const CommandBINPOS41: Command = 741;
    pub const CommandBINPOS42: Command = 742;
    pub const CommandBINPOS43: Command = 743;
    pub const CommandBINPOS44: Command = 744;
    pub const CommandBINPOS45: Command = 745;
    pub const CommandBINPOS46: Command = 746;
    pub const CommandBINPOS47: Command = 747;
    pub const CommandBINPOS48: Command = 748;
    pub const CommandBINPOS49: Command = 749;
    pub const CommandBINPOS50: Command = 750;
    pub const CommandBINPOS51: Command = 751;
    pub const CommandBINPOS52: Command = 752;
    pub const CommandBINPOS53: Command = 753;
    pub const CommandBINPOS54: Command = 754;
    pub const CommandBINPOS55: Command = 755;
    pub const CommandBINPOS56: Command = 756;
    pub const CommandBINPOS57: Command = 757;
    pub const CommandBINPOS58: Command = 758;
    pub const CommandBINPOS59: Command = 759;
    pub const CommandBINPOS60: Command = 760;
    pub const CommandBINPOS61: Command = 761;
    pub const CommandBINPOS62: Command = 762;
    pub const CommandBINPOS63: Command = 763;
    pub const CommandBINEDITEND: Command = 763;
}

/// SOURCE: `CalculationManager::CommandType` (Command.h:53-59, enum class, values 0..3).
/// Consumed by ExpressionCommandInterface.h (u07) and CEngine/History.cpp:406 (u06);
/// ported here because Command.h is wholly u02 scope.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum CalculationManagerCommandType {
    UnaryCommand,
    BinaryCommand,
    OperandCommand,
    Parentheses,
}

/// SOURCE: namespace `UnitConversionManager`, Command.h:6-27 (enum class, values 0..15).
/// Member order is load-bearing: discriminants are implicit in both C++ and Rust.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum UnitConversionManagerCommand {
    Zero,
    One,
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Decimal,
    Negate,
    Backspace,
    Clear,
    Reset,
    None,
}

/// SOURCE: namespace `CurrencyConversionManager`, Command.h:29-49 (enum class, values 0..14).
/// Note: no `Reset` member (ends after `Clear`); member order is load-bearing.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum CurrencyConversionManagerCommand {
    Zero,
    One,
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Decimal,
    Negate,
    Backspace,
    Clear,
    None,
}

#[cfg(test)]
mod tests {
    // ADDITIVE (not a C++ TEST_METHOD translation): pins the in-space duplicates/gaps
    // that downstream static_cast<OpCode> dispatch relies on. The CROSS-space
    // Command→OpCode conversion test lands with u06 (IDC_* space).
    use super::calculation_manager as cm;

    #[test]
    fn command_space_duplicates_and_gaps_match_source() {
        assert_eq!(cm::CommandNot, cm::CommandCOM); // both 101 (Command.h:95, 181)
        assert_eq!(cm::CommandBINEDITEND, cm::CommandBINPOS63); // both 763 (Command.h:268-269)
        assert_eq!(cm::CommandBINEDITSTART, cm::CommandBINPOS0); // both 700
        assert_eq!(cm::CommandAnd, 86);
        assert_eq!(cm::CommandXor, 88); // hole: 85 (Command.h:79)
        assert_eq!(cm::CommandOR, 87);
        assert_eq!(cm::CommandBINPOS0 + 63, cm::CommandBINPOS63); // consecutive BINPOS block
        assert_eq!(cm::Command0 + 15, cm::CommandF); // controls 0..F consecutive (Command.h:132)
    }
}
