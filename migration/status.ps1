# migration/status.ps1 — regenerate the STATUS.md snapshot from inventory.tsv + repo state.
# Run: pwsh migration/status.ps1
# Owned by the migration coordinator; never hand-edit emitted counts.

$ErrorActionPreference = 'Stop'
$root  = Split-Path -Parent $PSScriptRoot
$inv   = Join-Path $root 'migration/inventory.tsv'

if (-not (Test-Path $inv)) { throw "inventory.tsv not found at $inv" }

# --- parse inventory into objects (tab-separated; '#' comments) ---
$units = @()
foreach ($line in (Get-Content $inv)) {
    if (-not $line -or $line.StartsWith('#')) { continue }
    $c = $line -split "`t"
    $size = 0; if ($c[3] -match '^(\d+)') { $size = [int]$matches[1] }
    $units += [pscustomobject]@{
        Id     = $c[0]
        Size   = $size
        Wave   = $c[5]
        Status = $c[6]
    }
}

# --- counts by status ---
$statusGroups = $units | Group-Object Status | Sort-Object Name | ForEach-Object {
    $s = ($_.Group | Measure-Object Size -Sum).Sum
    "{0}: n={1} loc={2}" -f $_.Name, $_.Count, $s
}

# --- remaining SOURCE in scope (LOC of C++/headers under src/CalcManager) ---
$cpp = Get-ChildItem -Path (Join-Path $root 'src/CalcManager') -Recurse -File -Include *.cpp,*.h
$srcLoc = ($cpp | Get-Content | Measure-Object -Line).Lines

# --- total Rust workspace ---
$enginePath = Join-Path $root 'engine'
$rustLoc = 0; $rustFiles = 0
if (Test-Path $enginePath) {
    $rs = Get-ChildItem -Path $enginePath -Recurse -File -Filter *.rs
    # skip build artifacts
    $rs = $rs | Where-Object { $_.FullName -notmatch '\\target\\' }
    $rustFiles = @($rs).Count
    if ($rustFiles) { $rustLoc = ($rs | Get-Content | Measure-Object -Line).Lines }
}

'== Snapshot (' + (Get-Date -Format 'yyyy-MM-dd') + ') =='
"units: $($units.Count)"
"status ladder: " + ($statusGroups -join ' | ')
"remaining SOURCE LOC (src/CalcManager C++/H): $srcLoc"
"Rust workspace (engine/): $rustFiles files, $rustLoc LOC"
