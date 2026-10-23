// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// SOURCE: src/CalcManager/CalculatorResource.h (namespace CalculationManager::IResourceProvider)
// Behavior-preserving port; UTF-8 strings per migration/PORTING.md §3.
//
// Seam decision (2-reviewer gate, 2026-10-23): the C++ interface returns a TOTAL
// `std::wstring`; the Rust trait mirrors that with `String` (not `Option<String>`).
// Miss-empty semantics are a property of the ENGINE's string map
// (PORTING §4 unordered_map operator[] rule), not of this interface; provider-side
// fallbacks (`.`, `,`, `"3;0"`) stay OUT of the engine. PORTING.md §6 was patched
// to the same shape.

/// Should return a string from the resource table for strings used
/// by the calculation engine. The strings that must be defined
/// and the ids to define them with can be seen in [`crate::engine_strings`]
/// with SIDS prefix. Additionally it must provide values for string
/// ids "sDecimal", "sThousand" and "sGrouping". See
/// <https://technet.microsoft.com/en-us/library/cc782655(v=ws.10).aspx>
/// for what these values refer to.
pub trait IResourceProvider {
    fn get_cengine_string(&self, id: &str) -> String;
}
