// migration/harness/shims/pch.h — shadow shim so test TUs compile as console C++.
// This file is resolved INSTEAD of src/CalculatorUnitTests/pch.h via include-path
// precedence (shims dir is -I first for the test group only). The original pch.h
// is left untouched on disk; this shim provides the same engine includes plus a
// harmless subset of Windows headers — WITHOUT the UWP test host scaffolding
// (<collection.h>, <ppltasks.h>, winrt headers) that the test bodies never use.
#pragma once

#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif

#define NOMINMAX
#define UNIT_TESTS

#include <windows.h>
#include <cassert>
#include <concepts>
#include <memory>
#include <string>
#include <bitset>
#include <vector>
#include <map>
#include <list>
#include <stack>
#include <deque>
#include <regex>
#include <unordered_map>
#include <mutex>
#include <locale>
#include <sal.h>
#include <sstream>

// CalcManager Headers (same as UNITTESTS pch)
#include "CalcManager/ExpressionCommand.h"
#include "CalcManager/CalculatorResource.h"
#include "CalcManager/CalculatorManager.h"
#include "CalcManager/UnitConverter.h"

#include "Helpers.h"

#include "../shims/CppUnitTest.h"
