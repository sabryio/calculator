# migration/harness/build.ps1 — builds the baseline console oracle runner.
# Compiles src/CalcManager (plain C++, no WinRT) + the 5 engine test TUs + runner into
# migration/harness/build/CalcManagerOracle.exe.
# Requires VS dev shell (Launch-VsDevShell.ps1); this script bootstraps it automatically.
# Run: pwsh migration/harness/build.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# find Visual Studio
$vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
if (-not (Test-Path $vswhere)) { throw 'vswhere.exe not found; install Visual Studio with C++ tools' }
$vsPath = & $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
if (-not $vsPath) { throw 'No VS installation with VC tools found' }

$launcher = Join-Path $vsPath 'Common7\Tools\Launch-VsDevShell.ps1'
. $launcher -Arch amd64 -SkipAutomaticLocation | Out-Null

Set-Location $PSScriptRoot
$intDir = Join-Path $PSScriptRoot '.build\obj'
New-Item -ItemType Directory -Force -Path $intDir | Out-Null

$commonFlags = @('/nologo','/permissive-','/Zc:twoPhase-','/utf-8','/EHsc','/MDd','/Zi','/FS')

# --- group 1: engine (plain C++, own pch) ---
$engineSrc = @(
    'CEngine/calc.cpp','CEngine/CalcInput.cpp','CEngine/CalcUtils.cpp','CEngine/History.cpp',
    'CEngine/Number.cpp','CEngine/Rational.cpp','CEngine/RationalMath.cpp',
    'CEngine/scicomm.cpp','CEngine/scidisp.cpp','CEngine/scifunc.cpp','CEngine/scioper.cpp','CEngine/sciset.cpp',
    'Ratpack/basex.cpp','Ratpack/conv.cpp','Ratpack/exp.cpp','Ratpack/fact.cpp','Ratpack/itrans.cpp',
    'Ratpack/itransh.cpp','Ratpack/logic.cpp','Ratpack/num.cpp','Ratpack/rat.cpp','Ratpack/support.cpp',
    'Ratpack/trans.cpp','Ratpack/transh.cpp',
    'CalculatorHistory.cpp','CalculatorManager.cpp','ExpressionCommand.cpp','NumberFormattingUtils.cpp','UnitConverter.cpp'
) | ForEach-Object { Join-Path $root "src/CalcManager/$_" }

$engineFlags = @('/std:c++20') + $commonFlags + @('/I', (Join-Path $root 'src/CalcManager'))

& cl.exe @engineFlags @engineSrc /c /Fo"$intDir\" 2>&1 | Tee-Object -Variable engineOut
if ($LASTEXITCODE -ne 0) { throw "engine compile failed: LASTEXITCODE=$LASTEXITCODE" }

# --- group 2: tests + runner (shims first) ---
$testSrc = @(
    'CalcEngineTests.cpp','CalcInputTest.cpp','CalculatorManagerTest.cpp','RationalTest.cpp','UnitConverterTest.cpp'
) | ForEach-Object { Join-Path $root "src/CalculatorUnitTests/$_" }
$testSrc += (Join-Path $PSScriptRoot 'runner.cpp')

$testFlags = $commonFlags + @(
    '/I', (Join-Path $PSScriptRoot 'shims'),      # shim pch.h / Helpers.h / CppUnitTest.h FIRST
    '/I', (Join-Path $root 'src'),
    '/I', (Join-Path $root 'src/CalculatorUnitTests'),
    '/I', (Join-Path $root 'src/CalcManager'),
    '/D', 'UNIT_TESTS'
)

& cl.exe @testFlags @testSrc /c /Fo"$intDir\" 2>&1 | Tee-Object -Variable testOut
if ($LASTEXITCODE -ne 0) { throw "test compile failed: LASTEXITCODE=$LASTEXITCODE" }

# --- link ---
$objs = Get-ChildItem $intDir -Filter *.obj | ForEach-Object { $_.FullName }
& link.exe @objs /OUT:CalculatorOracle.exe /SUBSYSTEM:CONSOLE /MACHINE:X64 /ENTRY:wmainCRTStartup /DEBUG 2>&1 | Tee-Object -Variable linkOut
if ($LASTEXITCODE -ne 0) { throw "link failed: LASTEXITCODE=$LASTEXITCODE" }

Write-Host "Build OK -> $(Join-Path $PSScriptRoot 'CalculatorOracle.exe')"
