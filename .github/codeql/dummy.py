"""Minimal Python file for CodeQL.

This repository is primarily JavaScript/TypeScript.
Some org-level CodeQL setups may attempt Python analysis; having at least one
Python module avoids "no source code" failures.

@security No PII, no network, no secrets.
"""


def _codeql_sentinel() -> str:
    return "ok"
