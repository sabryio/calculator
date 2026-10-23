//! Rust port of the Windows Calculator `CalcManager` engine core.
//!
//! Behavior-preserving migration. Ground rules and every idiom rule live in
//! `migration/PORTING.md` (repo root) — read it before changing anything here.
//! Unit status: `migration/inventory.tsv`; dashboard: `migration/STATUS.md`.

pub mod calculator_resource;
pub mod command;
pub mod engine_strings;
pub mod number_formatting_utils;
pub mod radix_type;
