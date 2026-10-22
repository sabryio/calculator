// migration/harness/shims/Helpers.h — DERIVED from src/CalculatorUnitTests/Helpers.h
// Provenance (ORACLE.md, Step 1): original file contains an unused C++/CX template
// (VERIFY_VECTORS_ARE_EQUAL, matching `Windows::Foundation::Collections::IVector<T>^ esss`)
// that cannot parse under plain C++. Every COMPILATION UNIT that instantiates it is out of
// scope; no other content differs from the original. Verification: byte-for-byte equal
// except the marked section below. Generated once at Step 1; regenerate only with a
// recorded reason in LESSONS.md.
#pragma once
#include <CppUnitTest.h>

namespace CalculatorUnitTests
{
#define StandardModePrecision 16
#define ScientificModePrecision 32
#define ProgrammerModePrecision 64

    namespace UtfUtils
    {
        constexpr wchar_t MUL = 0x00d7; // Multiplication Symbol
    }
}

#define VERIFY_THROWS_EXPECTEDEXCEPTION(__operation, __exception)                                                                                              \
    {                                                                                                                                                          \
        bool __exceptionHit = false;                                                                                                                           \
        try                                                                                                                                                    \
        {                                                                                                                                                      \
            __operation;                                                                                                                                       \
        }                                                                                                                                                      \
        catch (__exception)                                                                                                                                    \
        {                                                                                                                                                      \
            __exceptionHit = true;                                                                                                                            \
        }                                                                                                                                                      \
                                                                                                                                                                \
        if (!__exceptionHit)                                                                                                                                   \
        {                                                                                                                                                      \
            Assert::Fail(L"Expected exception was not caught");                                                                                                \
        }                                                                                                                                                      \
    }

#define VERIFY_IS_NULL(__operation, ...)                                                                                                                       \
    {                                                                                                                                                          \
        Assert::IsTrue(nullptr == __operation, __VA_ARGS__);                                                                                                   \
    }

#define VERIFY_IS_NOT_NULL(__operation, ...)                                                                                                                   \
    {                                                                                                                                                          \
        Assert::IsTrue(nullptr != __operation, __VA_ARGS__);                                                                                                   \
    }

#define VERIFY_IS_LESS_THAN(__expectedLess, __expectedGreater, ...)                                                                                            \
    {                                                                                                                                                          \
        Assert::IsTrue(__expectedLess < __expectedGreater, __VA_ARGS__);                                                                                       \
    }

#define VERIFY_IS_GREATER_THAN(__expectedGreater, __expectedLess, ...)                                                                                         \
    {                                                                                                                                                          \
        Assert::IsTrue(__expectedGreater > __expectedLess, __VA_ARGS__);                                                                                       \
    }

#define VERIFY_ARE_EQUAL(__f1, __f2, ...)                                                                                                                      \
    {                                                                                                                                                          \
        Assert::IsTrue(__f1 == __f2, __VA_ARGS__);                                                                                                             \
    }

#define VERIFY_ARE_NOT_EQUAL(__f1, __f2, ...)                                                                                                                  \
    {                                                                                                                                                          \
        Assert::IsTrue(__f1 != __f2, __VA_ARGS__);                                                                                                             \
    }

#define VERIFY_IS_TRUE(__operation, ...)                                                                                                                       \
    {                                                                                                                                                          \
        Assert::IsTrue(__operation, __VA_ARGS__);                                                                                                              \
    }

#define VERIFY_IS_FALSE(__operation, ...)                                                                                                                      \
    {                                                                                                                                                          \
        Assert::IsFalse(__operation, __VA_ARGS__);                                                                                                             \
    }

#define VERIFY_IS_LESS_THAN_OR_EQUAL(__expectedLess, __expectedGreater, ...)                                                                                   \
    {                                                                                                                                                          \
        Assert::IsTrue(__expectedLess <= __expectedGreater, __VA_ARGS__);                                                                                      \
    }

#define VERIFY_IS_GREATER_THAN_OR_EQUAL(__expectedGreater, __expectedLess, ...)                                                                                \
    {                                                                                                                                                          \
        Assert::IsTrue(__expectedGreater >= __expectedLess, __VA_ARGS__);                                                                                      \
    }

// --- BEGIN derived replacement -----------------------------------------------
// Original: VERIFY_VECTORS_ARE_EQUAL(Windows::Foundation::Collections::IVector<T> ^ a, ...)
// Nothing in the 5 compiled test sources calls it (verified at Step 1); repla
// with a compile-time note rather than a stub that could be silently exercised.
template <typename T>
void VERIFY_VECTORS_ARE_EQUAL(const void* vecA, const void* vecB)
{
    static_assert(sizeof(T) == 0, "VERIFY_VECTORS_ARE_EQUAL (C++/CX) is not available "
                                  "in the console baseline harness; no test source calls it at Step 1");
}
// --- END derived replacement -------------------------------------------------
