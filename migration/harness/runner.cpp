// migration/harness/runner.cpp — headless console entry point for the baseline oracle run.
// Discovers all TEST_CLASS registrations, builds one instance per test class (which
// registers every TEST_METHOD bound to its instance), then executes all methods,
// reporting PASS/FAIL/COUNT to stdout; exits non-zero if any method failed.
#include <CppUnitTest.h>

#include <cwchar>
#include <iostream>
#include <string>

int wmain(int argc, wchar_t** argv)
{
    using namespace Microsoft::VisualStudio::CppUnitTestFramework::Shim;

    bool filterGreen = (argc > 1 && std::wstring(argv[1]) == L"--filter-green");

    // build all registered test classes; each ctor registers its methods in order
    for (auto* ce : ClassEntry::Classes())
    {
        ce->buildInstance();
    }

    auto& entries = Entries();
    size_t pass = 0, fail = 0;
    std::wcout << L"TOTAL_TESTS=" << entries.size() << std::endl;

    for (auto& e : entries)
    {
        std::wcout << L"TEST ";
        try
        {
            e.invoke();
            ++pass;
            if (filterGreen) { continue; }
            std::wcout << L"PASS";
        }
        catch (const AssertFailure& f)
        {
            ++fail;
            std::wcout << L"FAIL " << (f.message.empty() ? L"(no message)" : f.message);
        }
        catch (const std::exception& ex)
        {
            ++fail;
            std::wcout << L"ERROR std::exception: " << ex.what();
        }
        catch (...)
        {
            ++fail;
            std::wcout << L"ERROR unknown";
        }
        std::wcout << std::endl;
    }

    std::wcout << L"PASSED=" << pass << L" FAILED=" << fail << std::endl;
    return (fail == 0) ? 0 : 1;
}
