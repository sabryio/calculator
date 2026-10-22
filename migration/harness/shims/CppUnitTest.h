// migration/harness/shims/CppUnitTest.h
// MSTest-lite shim: headless console equivalent of the UWP C++ unit test framework.
// Used to execute the SOURCE engine's test suite unchanged for ORACLE baseline capture.
// Assert semantic surface required by the 5 test sources:
//   IsTrue, IsFalse, Fail, AreEqual, AreNotEqual, IsNull, IsNotNull
//   TEST_CLASS(X){...}; TEST_METHOD(m){...}  (macros expanding in-place inside a class body)
#pragma once

#include <cwchar>
#include <functional>
#include <string>
#include <vector>

// Global Logger shim (original framework has Logger::WriteMessage in the global namespace)
// Global Logger shim (original framework exposes Logger::WriteMessage in the global
// namespace; test TUs call it as ::Logger::WriteMessage).
struct Logger
{
    static void WriteMessage(const wchar_t* message)
    {
        std::fputws(message ? message : L"", stdout);
    }
    static void WriteMessage(const std::wstring& message)
    {
        std::fputws(message.c_str(), stdout);
    }
};

namespace Microsoft { namespace VisualStudio { namespace CppUnitTestFramework { namespace Shim {

    struct AssertFailure
    {
        std::wstring message;
    };

    struct MethodEntry
    {
        std::function<void()> invoke;
        std::wstring          method;
    };

    struct ClassEntry
    {
        std::function<void()> buildInstance;
        std::wstring          cls;

        // populates the global class registry at static-init time
        ClassEntry(std::function<void()> b, const wchar_t* n) : buildInstance{ std::move(b) }, cls{ n }
        {
            Classes().push_back(this);
        }

        static std::vector<ClassEntry*>& Classes()
        {
            static std::vector<ClassEntry*> s_classes;
            return s_classes;
        }
    };

    inline std::vector<MethodEntry>& Entries()
    {
        static std::vector<MethodEntry> s_entries;
        return s_entries;
    }

    struct Assert
    {
        static void Fail(const wchar_t* message = L"") { throw AssertFailure{ message }; }
        static void Fail(const std::wstring& message) { throw AssertFailure{ message }; }
        static void IsTrue(bool cond, const wchar_t* message = L"")
        {
            if (!cond) { throw AssertFailure{ message[0] ? message : L"IsTrue failed" }; }
        }
        static void IsFalse(bool cond, const wchar_t* message = L"")
        {
            if (cond) { throw AssertFailure{ message[0] ? message : L"IsFalse failed" }; }
        }
        template <typename T, typename U>
        static void AreEqual(const T& a, const U& b, const wchar_t* message = L"")
        {
            if (!(a == b)) { throw AssertFailure{ message[0] ? message : L"AreEqual failed" }; }
        }
        template <typename T, typename U>
        static void AreNotEqual(const T& a, const U& b, const wchar_t* message = L"")
        {
            if (a == b) { throw AssertFailure{ message[0] ? message : L"AreNotEqual failed" }; }
        }
        // pointer-null helpers used by Helpers.h macros
        template <typename T>
        static void IsNull(T* p, const wchar_t* message = L"")
        {
            if (static_cast<void*>(p) != nullptr) { throw AssertFailure{ message[0] ? message : L"IsNull failed" }; }
        }
        template <typename T>
        static void IsNotNull(T* p, const wchar_t* message = L"")
        {
            if (static_cast<void*>(p) == nullptr) { throw AssertFailure{ message[0] ? message : L"IsNotNull failed" }; }
        }
        static void IsNull(std::nullptr_t, const wchar_t* message = L"") { IsNull((void*)nullptr, message); }
        static void IsNotNull(std::nullptr_t, const wchar_t* message = L"") { IsNotNull((void*)nullptr, message); }
    };

}}}}

#define TEST_CLASS(CType)                                                                                                        \
    public:                                                                                                                       \
    static inline Microsoft::VisualStudio::CppUnitTestFramework::Shim::ClassEntry s_shim_class_reg =                              \
    {                                                                                                                             \
        []() -> void { static CType s_shim_inst; }, L ## #CType                                                                   \
    };

#define TEST_METHOD(MName)                                                                                                       \
    public:                                                                                                                       \
    Microsoft::VisualStudio::CppUnitTestFramework::Shim::MethodEntry s_shim_##MName =                                             \
    {                                                                                                                             \
        [this]() { this->MName(); }, L ## #MName                                                                                  \
    };                                                                                                                            \
    void MName();
